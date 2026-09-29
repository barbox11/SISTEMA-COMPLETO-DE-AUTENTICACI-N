import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Si no hay token → /login. Si debe cambiar password y no va a esa ruta → /cambiar-password.
export function RutaProtegida({ children }) {
  const { estaAutenticado, requiereCambioPassword } = useAuth();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (requiereCambioPassword) return <Navigate to="/cambiar-password" replace />;
  return children;
}

// Solo para /cambiar-password: exige estar autenticado, pero permite cambioRequerido.
export function RutaCambioObligatorio({ children }) {
  const { estaAutenticado } = useAuth();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  return children;
}

// Rutas públicas: si ya está autenticado sin cambio pendiente → /perfil.
export function RutaPublica({ children }) {
  const { estaAutenticado, requiereCambioPassword } = useAuth();
  if (estaAutenticado && requiereCambioPassword) return <Navigate to="/cambiar-password" replace />;
  if (estaAutenticado) return <Navigate to="/perfil" replace />;
  return children;
}
