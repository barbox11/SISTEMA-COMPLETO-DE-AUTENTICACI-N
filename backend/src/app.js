const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { errorHandler, rutaNoEncontrada } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

function crearApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173'],
      credentials: true,
    })
  );

  const limitadorGeneral = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Demasiadas solicitudes. Inténtalo más tarde.', codigo: 'RATE_LIMIT' },
  });
  app.use('/api/', limitadorGeneral);

  const limitadorAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Demasiados intentos de autenticación. Inténtalo más tarde.', codigo: 'RATE_LIMIT' },
  });
  app.use('/api/auth/login', limitadorAuth);
  app.use('/api/auth/forgot-password', limitadorAuth);

  app.get('/api/salud', (req, res) => {
    res.json({ ok: true, mensaje: 'API en funcionamiento.', fecha: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  app.use(rutaNoEncontrada);
  app.use(errorHandler);

  return app;
}

module.exports = crearApp;
