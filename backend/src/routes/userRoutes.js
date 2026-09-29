const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, requierePasswordDefinitiva } = require('../middlewares/auth');
const { actualizarPerfilSchema, validar } = require('../validators/authValidators');
const { actualizarMiPerfil } = require('../controllers/userController');

const router = Router();

router.patch('/me', authMiddleware, requierePasswordDefinitiva, validar(actualizarPerfilSchema), asyncHandler(actualizarMiPerfil));

module.exports = router;
