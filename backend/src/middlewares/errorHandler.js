const env = require('../config/env');
const { CODIGOS } = require('../utils/errores');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errores de Mongoose
  if (err && err.name === 'ValidationError') {
    return res.status(422).json({
      ok: false,
      mensaje: 'Los datos enviados no son válidos.',
      codigo: CODIGOS.VALIDATION_ERROR,
    });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({
      ok: false,
      mensaje: 'El correo ya se encuentra registrado.',
      codigo: 'USER_ALREADY_EXISTS',
    });
  }

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const codigo = err.codigo || CODIGOS.INTERNAL_ERROR;

  if (!env.esProduccion) {
    console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  }

  return res.status(statusCode).json({
    ok: false,
    mensaje: statusCode === 500 ? 'Ocurrió un error interno. Inténtalo más tarde.' : err.message,
    codigo,
  });
}

function rutaNoEncontrada(req, res) {
  return res.status(404).json({
    ok: false,
    mensaje: 'El recurso solicitado no existe.',
    codigo: CODIGOS.NOT_FOUND,
  });
}

module.exports = { errorHandler, rutaNoEncontrada };
