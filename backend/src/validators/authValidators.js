const { z } = require('zod');

const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?]).{8,64}$/;

const mensajePassword =
  'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial (!@#$%&*?).';

const esquemaCorreo = z
  .string({ required_error: 'El correo es obligatorio.' })
  .trim()
  .min(1, 'El correo es obligatorio.')
  .max(120, 'El correo es demasiado largo.')
  .email('El formato del correo no es válido.')
  .transform((v) => v.toLowerCase());

const esquemaNombre = (campo) =>
  z
    .string({ required_error: `El campo ${campo} es obligatorio.` })
    .trim()
    .min(2, `El campo ${campo} debe tener al menos 2 caracteres.`)
    .max(60, `El campo ${campo} no puede superar 60 caracteres.`);

const registroSchema = z.object({
  nombre: esquemaNombre('nombre'),
  apellido: esquemaNombre('apellido'),
  correo: esquemaCorreo,
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .regex(REGEX_PASSWORD, mensajePassword),
  rol: z.enum(['usuario', 'admin']).optional().default('usuario'),
});

const loginSchema = z.object({
  correo: esquemaCorreo,
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(1, 'La contraseña es obligatoria.')
    .max(128, 'La contraseña es demasiado larga.'),
});

const cambioPasswordSchema = z.object({
  passwordActual: z.string({ required_error: 'La contraseña actual es obligatoria.' }).min(1),
  nuevaPassword: z
    .string({ required_error: 'La nueva contraseña es obligatoria.' })
    .regex(REGEX_PASSWORD, mensajePassword),
  confirmarPassword: z.string({ required_error: 'La confirmación es obligatoria.' }),
}).refine((d) => d.nuevaPassword === d.confirmarPassword, {
  message: 'La nueva contraseña y su confirmación no coinciden.',
  path: ['confirmarPassword'],
});

const forgotPasswordSchema = z.object({ correo: esquemaCorreo });

const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: 'El token es obligatorio.' }).min(10, 'El token no es válido.'),
    nuevaPassword: z.string({ required_error: 'La nueva contraseña es obligatoria.' }).regex(REGEX_PASSWORD, mensajePassword),
    confirmarPassword: z.string({ required_error: 'La confirmación es obligatoria.' }),
  })
  .refine((d) => d.nuevaPassword === d.confirmarPassword, {
    message: 'La nueva contraseña y su confirmación no coinciden.',
    path: ['confirmarPassword'],
  });

const actualizarPerfilSchema = z.object({
  nombre: esquemaNombre('nombre').optional(),
  apellido: esquemaNombre('apellido').optional(),
}).refine((d) => d.nombre !== undefined || d.apellido !== undefined, {
  message: 'Debes enviar al menos un campo para actualizar (nombre o apellido).',
});

function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const primerError = resultado.error.issues[0];
      return res.status(422).json({
        ok: false,
        mensaje: primerError?.message || 'Los datos enviados no son válidos.',
        codigo: 'VALIDATION_ERROR',
        errores: resultado.error.issues.map((i) => ({
          campo: i.path.join('.'),
          mensaje: i.message,
        })),
      });
    }
    req.body = resultado.data;
    return next();
  };
}

module.exports = {
  REGEX_PASSWORD,
  registroSchema,
  loginSchema,
  cambioPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  actualizarPerfilSchema,
  validar,
};
