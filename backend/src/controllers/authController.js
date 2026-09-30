const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Usuario = require('../models/Usuario');
const generarPasswordTemporal = require('../utils/generarPassword');
const { crearError, CODIGOS } = require('../utils/errores');
const emailService = require('../services/emailService');

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;
const MENSAJE_CREDENCIALES = 'Las credenciales proporcionadas no son válidas.';

function firmarToken(usuario) {
  return jwt.sign(
    { sub: usuario._id.toString(), rol: usuario.rol, cambioRequerido: usuario.requiereCambioPassword },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /api/auth/register — registra con contraseña temporal
async function registrar(req, res) {
  const { nombre, apellido, correo, rol } = req.body;

  const existente = await Usuario.findOne({ correo });
  if (existente) {
    throw crearError('El correo ya se encuentra registrado.', 409, CODIGOS.USER_ALREADY_EXISTS);
  }

  const passwordTemporal = generarPasswordTemporal(12);
  const passwordHash = await bcrypt.hash(passwordTemporal, 12);

  const usuario = await Usuario.create({
    nombre,
    apellido,
    correo,
    rol: rol === 'admin' ? 'admin' : 'usuario',
    passwordHash,
    requiereCambioPassword: true,
    passwordCreatedAt: new Date(),
  });

  try {
    await emailService.enviarBienvenida({ nombre: usuario.nombre, correo: usuario.correo, passwordTemporal });
  } catch (error) {
    // No bloquea el registro si el correo falla
  }

  return res.status(201).json({
    ok: true,
    mensaje: 'Usuario registrado correctamente. Se envió la contraseña temporal al correo.',
    datos: {
      id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
      requiereCambioPassword: true,
    },
    ...(env.esProduccion ? {} : { passwordTemporal }),
  });
}

// POST /api/auth/login
async function iniciarSesion(req, res) {
  const { correo, password } = req.body;

  const usuario = await Usuario.findOne({ correo }).select('+passwordHash');
  if (!usuario) {
    return res.status(401).json({ ok: false, mensaje: MENSAJE_CREDENCIALES, codigo: CODIGOS.AUTH_INVALID_CREDENTIALS });
  }
  if (!usuario.activo) {
    return res.status(403).json({ ok: false, mensaje: 'Tu cuenta se encuentra desactivada. Contacta al administrador.', codigo: CODIGOS.AUTH_USER_INACTIVE });
  }
  if (usuario.estaBloqueado()) {
    return res.status(429).json({ ok: false, mensaje: 'Demasiados intentos fallidos. Inténtalo más tarde.', codigo: CODIGOS.RATE_LIMIT });
  }

  const coincide = await usuario.compararPassword(password);
  if (!coincide) {
    usuario.intentosFallidos += 1;
    if (usuario.intentosFallidos >= MAX_INTENTOS) {
      usuario.bloqueadoHasta = new Date(Date.now() + BLOQUEO_MINUTOS * 60 * 1000);
      usuario.intentosFallidos = 0;
    }
    await usuario.save();
    return res.status(401).json({ ok: false, mensaje: MENSAJE_CREDENCIALES, codigo: CODIGOS.AUTH_INVALID_CREDENTIALS });
  }

  if (usuario.requiereCambioPassword && usuario.passwordCreatedAt) {
    const unDia = 24 * 60 * 60 * 1000;
    if (Date.now() - usuario.passwordCreatedAt.getTime() > unDia) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Su contraseña temporal ha expirado. Debe renovarla.',
        codigo: 'PASSWORD_EXPIRED',
      });
    }
  }

  usuario.intentosFallidos = 0;
  usuario.bloqueadoHasta = null;
  await usuario.save();

  const token = firmarToken(usuario);

  if (usuario.requiereCambioPassword) {
    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión correcto. Debes cambiar tu contraseña temporal.',
      requiereCambioPassword: true,
      codigo: CODIGOS.AUTH_PASSWORD_CHANGE_REQUIRED,
      token,
      datos: { nombre: usuario.nombre, correo: usuario.correo },
    });
  }

  return res.json({
    ok: true,
    mensaje: 'Inicio de sesión correcto. Bienvenido.',
    requiereCambioPassword: false,
    token,
    datos: { nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo, rol: usuario.rol },
  });
}

// PATCH /api/auth/change-password (requiere JWT; permite token con cambioRequerido)
async function cambiarPassword(req, res) {
  const { passwordActual, nuevaPassword } = req.body;
  const usuario = await Usuario.findById(req.usuario._id).select('+passwordHash');
  if (!usuario) throw crearError('Usuario no encontrado.', 404, CODIGOS.USER_NOT_FOUND);

  const coincide = await usuario.compararPassword(passwordActual);
  if (!coincide) {
    throw crearError('La contraseña actual no es correcta.', 401, CODIGOS.AUTH_INVALID_CREDENTIALS);
  }
  const esIgual = await bcrypt.compare(nuevaPassword, usuario.passwordHash);
  if (esIgual) {
    throw crearError('La nueva contraseña no puede ser igual a la anterior.', 400, CODIGOS.PASSWORD_SAME_AS_OLD);
  }

  usuario.passwordHash = await bcrypt.hash(nuevaPassword, 12);
  usuario.requiereCambioPassword = false;
  usuario.resetTokenHash = null;
  usuario.resetTokenExpira = null;
  await usuario.save();

  try {
    await emailService.enviarConfirmacionCambio({ nombre: usuario.nombre, correo: usuario.correo });
  } catch (_) {
    // No bloquea el cambio si el correo falla
  }

  return res.json({ ok: true, mensaje: 'La contraseña fue actualizada correctamente.', codigo: 'PASSWORD_UPDATED' });
}

// POST /api/auth/forgot-password — respuesta genérica anti-enumeración
async function solicitarRecuperacion(req, res) {
  const { correo } = req.body;
  const mensajeGenerico = 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.';

  const usuario = await Usuario.findOne({ correo }).select('+resetTokenHash');
  if (usuario && usuario.activo) {
    const token = crypto.randomBytes(32).toString('hex');
    usuario.resetTokenHash = hashToken(token);
    usuario.resetTokenExpira = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
    await usuario.save();

    const resetUrl = `${env.FRONTEND_URL}/restablecer-password?token=${token}`;
    try {
      await emailService.enviarRecuperacion({
        nombre: usuario.nombre,
        correo: usuario.correo,
        resetUrl,
        minutos: env.PASSWORD_RESET_EXPIRES_MINUTES,
      });
    } catch (error) {
      usuario.resetTokenHash = null;
      usuario.resetTokenExpira = null;
      await usuario.save();
      throw crearError('No fue posible enviar el correo de recuperación. Inténtalo más tarde.', 502, CODIGOS.EMAIL_SEND_ERROR);
    }
    // En desarrollo devolvemos el token para probar sin SMTP
    if (!env.esProduccion) {
      return res.json({ ok: true, mensaje: mensajeGenerico, tokenDesarrollo: token });
    }
  }
  return res.json({ ok: true, mensaje: mensajeGenerico });
}

// POST /api/auth/reset-password
async function restablecerPassword(req, res) {
  const { token, nuevaPassword } = req.body;
  const tokenHash = hashToken(token);

  const usuario = await Usuario.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpira: { $gt: new Date() },
  }).select('+passwordHash +resetTokenHash');

  if (!usuario) {
    // Distinguir expirado vs inválido sin filtrar demasiado
    const expirado = await Usuario.findOne({ resetTokenHash: tokenHash }).select('+passwordHash');
    if (expirado) {
      throw crearError('El enlace de recuperación ha expirado. Solicita uno nuevo.', 400, CODIGOS.RESET_TOKEN_EXPIRED);
    }
    throw crearError('El token de recuperación no es válido.', 400, CODIGOS.RESET_TOKEN_INVALID);
  }

  const esIgual = await bcrypt.compare(nuevaPassword, usuario.passwordHash);
  if (esIgual) {
    throw crearError('La nueva contraseña no puede ser igual a la anterior.', 400, CODIGOS.PASSWORD_SAME_AS_OLD);
  }

  usuario.passwordHash = await bcrypt.hash(nuevaPassword, 12);
  usuario.resetTokenHash = null;
  usuario.resetTokenExpira = null;
  usuario.requiereCambioPassword = false;
  usuario.intentosFallidos = 0;
  usuario.bloqueadoHasta = null;
  await usuario.save();

  try {
    await emailService.enviarConfirmacionCambio({ nombre: usuario.nombre, correo: usuario.correo });
  } catch (_) {}

  return res.json({ ok: true, mensaje: 'Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.' });
}

// POST /api/auth/logout — con JWT stateless el cliente descarta el token
async function cerrarSesion(req, res) {
  return res.json({ ok: true, mensaje: 'Sesión cerrada correctamente.' });
}

// GET /api/auth/perfil
async function obtenerPerfil(req, res) {
  return res.json({ ok: true, mensaje: 'Perfil obtenido correctamente.', datos: req.usuario });
}

module.exports = {
  registrar,
  iniciarSesion,
  cambiarPassword,
  solicitarRecuperacion,
  restablecerPassword,
  cerrarSesion,
  obtenerPerfil,
};
