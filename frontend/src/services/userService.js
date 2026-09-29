import api from './api.js';

export async function actualizarPerfil(datos) {
  const { data } = await api.patch('/users/me', datos);
  return data;
}
