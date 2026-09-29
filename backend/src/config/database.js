const mongoose = require('mongoose');
const env = require('./env');

async function conectarDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log('Base de datos MongoDB conectada correctamente.');
}

module.exports = conectarDB;
