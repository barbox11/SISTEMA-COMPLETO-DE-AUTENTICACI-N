const Usuario = require('../models/Usuario');
const { crearError, CODIGOS } = require('../utils/errores');

async function actualizarMiPerfil(req, res) {
  const { nombre, apellido } = req.body;
  const usuario = await Usuario.findById(req.usuario._id);
  if (!usuario) throw crearError('Usuario no encontrado.', 404, CODIGOS.USER_NOT_FOUND);

  // Solo campos no sensibles
  if (nombre !== undefined) usuario.nombre = nombre;
  if (apellido !== undefined) usuario.apellido = apellido;
  await usuario.save();

  return res.json({
    ok: true,
    mensaje: 'Tus datos fueron actualizados correctamente.',
    datos: usuario,
  });
}

module.exports = { actualizarMiPerfil };
