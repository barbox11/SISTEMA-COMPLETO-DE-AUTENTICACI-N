const rateLimit = require('express-rate-limit');

const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos. Inténtalo más tarde.', codigo: 'RATE_LIMIT' },
});

module.exports = limitadorAuth;
