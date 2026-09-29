import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

// Decisión: Context API (sin Redux/Zustand) porque el estado de auth es pequeño
// (usuario, token, requiereCambioPassword) y evita dependencias extra.
// Se persiste solo token+usuario mínimo en localStorage (versionado).
const AuthContext = createContext(null);
const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

function leerSesionInicial() {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const usuario = JSON.parse(localStorage.getItem(CLAVE_USUARIO) || 'null');
    return { token, usuario };
  } catch {
    return { token: null, usuario: null };
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionInicial);
  const [cargando, setCargando] = useState(false);

  const estaAutenticado = Boolean(sesion.token);
  const requiereCambioPassword = Boolean(sesion.usuario?.requiereCambioPassword);

  const iniciarSesion = useCallback(async (correo, password) => {
    setCargando(true);
    try {
      const respuesta = await authService.login(correo, password);
      const token = respuesta.token;
      const usuario = {
        ...(respuesta.datos || {}),
        requiereCambioPassword: respuesta.requiereCambioPassword === true,
      };
      localStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
      setSesion({ token, usuario });
      return respuesta;
    } finally {
      setCargando(false);
    }
  }, []);

  const marcarPasswordActualizada = useCallback(() => {
    setSesion((prev) => {
      if (!prev.usuario) return prev;
      const usuario = { ...prev.usuario, requiereCambioPassword: false };
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
      return { ...prev, usuario };
    });
  }, []);

  const cerrarSesion = useCallback(async () => {
    await authService.cerrarSesion();
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    setSesion({ token: null, usuario: null });
  }, []);

  const valor = useMemo(
    () => ({ ...sesion, estaAutenticado, requiereCambioPassword, cargando, iniciarSesion, cerrarSesion, marcarPasswordActualizada }),
    [sesion, estaAutenticado, requiereCambioPassword, cargando, iniciarSesion, cerrarSesion, marcarPasswordActualizada]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
