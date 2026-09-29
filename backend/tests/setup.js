const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const crearApp = require('../src/app');

let mongo;
let app;

process.env.JWT_SECRET = 'secreto_para_pruebas_minimo_32_caracteres_123';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    instance: { startTimeout: 120000 },
  });
  process.env.MONGODB_URI = mongo.getUri('auth_test');
  await mongoose.connect(process.env.MONGODB_URI);
  app = crearApp();
}, 120000);

afterEach(async () => {
  const colecciones = await mongoose.connection.db.collections();
  for (const c of colecciones) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

function obtenerApp() {
  if (!app) app = crearApp();
  return app;
}

module.exports = { obtenerApp };
