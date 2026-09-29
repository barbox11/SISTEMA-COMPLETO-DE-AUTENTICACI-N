const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../middlewares/auth');
const {
  registroSchema,
  loginSchema,
  cambioPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validar,
} = require('../validators/authValidators');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/register', validar(registroSchema), asyncHandler(ctrl.registrar));
router.post('/login', validar(loginSchema), asyncHandler(ctrl.iniciarSesion));
router.post('/forgot-password', validar(forgotPasswordSchema), asyncHandler(ctrl.solicitarRecuperacion));
router.post('/reset-password', validar(resetPasswordSchema), asyncHandler(ctrl.restablecerPassword));

// Rutas autenticadas
router.patch('/change-password', authMiddleware, validar(cambioPasswordSchema), asyncHandler(ctrl.cambiarPassword));
router.post('/logout', authMiddleware, asyncHandler(ctrl.cerrarSesion));
router.get('/perfil', authMiddleware, asyncHandler(ctrl.obtenerPerfil));

module.exports = router;
