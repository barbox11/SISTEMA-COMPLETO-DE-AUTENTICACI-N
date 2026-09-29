import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expiró o es inválido, limpia sesión y redirige a /login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const codigo = error?.response?.data?.codigo;
    if (codigo === 'AUTH_TOKEN_EXPIRED' || codigo === 'AUTH_TOKEN_INVALID' || codigo === 'AUTH_NO_TOKEN') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/iniciar-sesion') window.location.href = '/iniciar-sesion';
    }
    return Promise.reject(error);
  }
);

export default api;
