const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { CODIGOS } = require('../utils/errores');
const Usuario = require('../models/Usuario');

function extraerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

async function authMiddleware(req, res, next) {
  const token = extraerToken(req);
  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: 'No se proporcionó token de autenticación. Inicia sesión nuevamente.',
      codigo: CODIGOS.AUTH_NO_TOKEN,
    });
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const usuario = await Usuario.findById(payload.sub);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        ok: false,
        mensaje: 'La sesión no es válida. Inicia sesión nuevamente.',
        codigo: CODIGOS.AUTH_TOKEN_INVALID,
      });
    }
    req.usuario = usuario;
    req.tokenPayload = payload;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        mensaje: 'La sesión ha expirado. Inicia sesión nuevamente.',
        codigo: CODIGOS.AUTH_TOKEN_EXPIRED,
      });
    }
    return res.status(401).json({
      ok: false,
      mensaje: 'El token de autenticación no es válido.',
      codigo: CODIGOS.AUTH_TOKEN_INVALID,
    });
  }
}

// Bloquea el acceso a rutas protegidas si el usuario aún debe cambiar su password temporal.
// La ruta PATCH /api/auth/change-password queda excluida (se valida dentro del controlador).
function requierePasswordDefinitiva(req, res, next) {
  if (req.usuario && req.usuario.requiereCambioPassword) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Debes cambiar tu contraseña temporal antes de continuar.',
      codigo: CODIGOS.AUTH_PASSWORD_CHANGE_REQUIRED,
      requiereCambioPassword: true,
    });
  }
  return next();
}

module.exports = { authMiddleware, requierePasswordDefinitiva };
