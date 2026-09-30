const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function obtenerTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

function cargarPlantilla(nombreArchivo, variables) {
  const ruta = path.join(__dirname, '..', 'templates', 'emails', nombreArchivo);
  let html = fs.readFileSync(ruta, 'utf8');
  for (const [clave, valor] of Object.entries(variables)) {
    html = html.split(`{{${clave}}}`).join(String(valor ?? ''));
  }
  return html;
}

async function enviarCorreo({ para, asunto, plantilla, variables }) {
  // Modo desarrollo sin SMTP configurado: registra en consola y no falla
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.log('--- CORREO SIMULADO (configura SMTP en .env) ---');
    console.log(`Para: ${para} | Asunto: ${asunto}`);
    console.log('Variables:', variables);
    return { simulado: true };
  }
  try {
    const html = cargarPlantilla(plantilla, variables);
    const info = await obtenerTransporter().sendMail({
      from: env.SMTP_FROM,
      to: para,
      subject: asunto,
      html,
    });
    return { simulado: false, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    const err = new Error('No fue posible enviar el correo. IntÃ©ntalo mÃ¡s tarde.');
    err.statusCode = 502;
    err.codigo = 'EMAIL_SEND_ERROR';
    throw err;
  }
}

async function enviarBienvenida({ nombre, correo, passwordTemporal }) {
  return enviarCorreo({
    para: correo,
    asunto: 'Bienvenido: tu cuenta fue creada, cambia tu contraseÃ±a temporal',
    plantilla: 'bienvenida.html',
    variables: {
      nombre,
      correo,
      passwordTemporal,
      loginUrl: `${env.FRONTEND_URL}/iniciar-sesion`,
      anio: new Date().getFullYear(),
    },
  });
}

async function enviarRecuperacion({ nombre, correo, resetUrl, minutos }) {
  return enviarCorreo({
    para: correo,
    asunto: 'Recupera tu contraseÃ±a',
    plantilla: 'recuperacion.html',
    variables: { nombre, resetUrl, minutos, anio: new Date().getFullYear() },
  });
}

async function enviarConfirmacionCambio({ nombre, correo }) {
  return enviarCorreo({
    para: correo,
    asunto: 'Tu contraseÃ±a fue actualizada',
    plantilla: 'cambio-confirmado.html',
    variables: { nombre, loginUrl: `${env.FRONTEND_URL}/iniciar-sesion`, anio: new Date().getFullYear() },
  });
}

module.exports = { enviarBienvenida, enviarRecuperacion, enviarConfirmacionCambio };

