const env = require('./config/env');
const conectarDB = require('./config/database');
const crearApp = require('./app');

async function iniciar() {
  try {
    await conectarDB();
    const app = crearApp();
    app.listen(env.PORT, () => {
      console.log(`Servidor backend escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  iniciar();
}

module.exports = { iniciar };
