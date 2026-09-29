const request = require('supertest');
const { obtenerApp } = require('./setup');

describe('Sistema de autenticación', () => {
  test('flujo completo: registro -> login temporal -> cambio obligatorio -> login normal', async () => {
    const app = obtenerApp();

    const registro = await request(app).post('/api/auth/register').send({
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
    });
    expect(registro.status).toBe(201);
    expect(registro.body.ok).toBe(true);
    expect(registro.body.datos.requiereCambioPassword).toBe(true);
    const temporal = registro.body.passwordTemporal;
    expect(temporal).toBeTruthy();

    const login1 = await request(app).post('/api/auth/login').send({
      correo: 'juan@example.com',
      password: temporal,
    });
    expect(login1.status).toBe(200);
    expect(login1.body.requiereCambioPassword).toBe(true);
    const tokenTemporal = login1.body.token;

    // Con password temporal no puede acceder a rutas protegidas normales
    const bloqueado = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${tokenTemporal}`)
      .send({ nombre: 'Juanito' });
    expect(bloqueado.status).toBe(403);
    expect(bloqueado.body.codigo).toBe('AUTH_PASSWORD_CHANGE_REQUIRED');

    const cambio = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokenTemporal}`)
      .send({
        passwordActual: temporal,
        nuevaPassword: 'NuevaPassword123!',
        confirmarPassword: 'NuevaPassword123!',
      });
    expect(cambio.status).toBe(200);

    const login2 = await request(app).post('/api/auth/login').send({
      correo: 'juan@example.com',
      password: 'NuevaPassword123!',
    });
    expect(login2.status).toBe(200);
    expect(login2.body.requiereCambioPassword).toBe(false);
  });

  test('login con credenciales inválidas devuelve 401 genérico', async () => {
    const app = obtenerApp();
    const res = await request(app).post('/api/auth/login').send({
      correo: 'nadie@example.com',
      password: 'Cualquiera123!',
    });
    expect(res.status).toBe(401);
    expect(res.body.mensaje).toBe('Las credenciales proporcionadas no son válidas.');
  });

  test('registro duplicado devuelve 409', async () => {
    const app = obtenerApp();
    const datos = { nombre: 'Ana', apellido: 'López', correo: 'ana@example.com' };
    await request(app).post('/api/auth/register').send(datos);
    const dup = await request(app).post('/api/auth/register').send(datos);
    expect(dup.status).toBe(409);
  });

  test('recuperación y restablecimiento funcionan y el token es de un solo uso', async () => {
    const app = obtenerApp();
    const reg = await request(app).post('/api/auth/register').send({
      nombre: 'Luis',
      apellido: 'Gómez',
      correo: 'luis@example.com',
    });
    const temporal = reg.body.passwordTemporal;
    // Define password definitiva primero
    const login = await request(app).post('/api/auth/login').send({ correo: 'luis@example.com', password: temporal });
    await request(app).patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ passwordActual: temporal, nuevaPassword: 'ClaveInicial123!', confirmarPassword: 'ClaveInicial123!' });

    const forgot = await request(app).post('/api/auth/forgot-password').send({ correo: 'luis@example.com' });
    expect(forgot.status).toBe(200);
    const token = forgot.body.tokenDesarrollo;
    expect(token).toBeTruthy();

    const reset = await request(app).post('/api/auth/reset-password').send({
      token,
      nuevaPassword: 'ClaveNueva123!',
      confirmarPassword: 'ClaveNueva123!',
    });
    expect(reset.status).toBe(200);

    const reuso = await request(app).post('/api/auth/reset-password').send({
      token,
      nuevaPassword: 'OtraClave123!',
      confirmarPassword: 'OtraClave123!',
    });
    expect(reuso.status).toBe(400);
  });

  test('ruta protegida sin token devuelve 401', async () => {
    const app = obtenerApp();
    const res = await request(app).get('/api/auth/perfil');
    expect(res.status).toBe(401);
  });
});
