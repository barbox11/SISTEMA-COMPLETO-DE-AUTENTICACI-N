const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 60 },
    apellido: { type: String, required: true, trim: true, maxlength: 60 },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
    activo: { type: Boolean, default: true },
    requiereCambioPassword: { type: Boolean, default: true },
    passwordCreatedAt: { type: Date, default: null },
    intentosFallidos: { type: Number, default: 0 },
    bloqueadoHasta: { type: Date, default: null },
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpira: { type: Date, default: null },
  },
  { timestamps: true }
);

usuarioSchema.methods.compararPassword = function (passwordPlana) {
  return bcrypt.compare(passwordPlana, this.passwordHash);
};

usuarioSchema.methods.estaBloqueado = function () {
  return this.bloqueadoHasta && this.bloqueadoHasta > new Date();
};

// Nunca exponer hashes ni tokens al convertir a JSON
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetTokenHash;
  delete obj.__v;
  return obj;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
