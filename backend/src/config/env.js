require('dotenv').config();

function requerido(nombre, valorPorDefecto) {
  const valor = process.env[nombre] ?? valorPorDefecto;
  if (valor === undefined || valor === '') {
    throw new Error(`Falta la variable de entorno obligatoria: ${nombre}`);
  }
  return valor;
}

const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: requerido('MONGODB_URI', 'mongodb://admin:admin123@127.0.0.1:27017/auth_db?authSource=admin'),
  JWT_SECRET: process.env.JWT_SECRET || 'secreto_temporal_solo_para_desarrollo_cambiar',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: String(process.env.SMTP_SECURE || 'false') === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Sistema de Autenticación <no-reply@example.com>',
  PASSWORD_RESET_EXPIRES_MINUTES: parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES || '15', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  esProduccion: (process.env.NODE_ENV || 'development') === 'production',
};

module.exports = env;
