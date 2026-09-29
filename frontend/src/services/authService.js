import api from './api.js';

// Capa de servicios: los componentes nunca llaman a axios directamente.
export async function login(correo, password) {
  const { data } = await api.post('/auth/login', { correo, password });
  return data;
}

export async function registrar(nombre, apellido, correo, password) {
  const { data } = await api.post('/auth/register', { nombre, apellido, correo, password });
  return data;
}

export async function cambiarPassword(passwordActual, nuevaPassword, confirmarPassword) {
  const { data } = await api.patch('/auth/change-password', {
    passwordActual,
    nuevaPassword,
    confirmarPassword,
  });
  return data;
}

export async function solicitarRecuperacion(correo) {
  const { data } = await api.post('/auth/forgot-password', { correo });
  return data;
}

export async function restablecerPassword(token, nuevaPassword, confirmarPassword) {
  const { data } = await api.post('/auth/reset-password', { token, nuevaPassword, confirmarPassword });
  return data;
}

export async function cerrarSesion() {
  try {
    await api.post('/auth/logout');
  } catch (_) {
    // Aunque falle el backend, el frontend siempre limpia la sesión
  }
}

export async function obtenerPerfil() {
  const { data } = await api.get('/auth/perfil');
  return data;
}
