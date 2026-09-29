import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { RutaProtegida, RutaCambioObligatorio, RutaPublica } from './routes/RutasProtegidas.jsx';
import {
  PaginaLogin,
  PaginaRegistro,
  PaginaCambioPassword,
  PaginaRecuperar,
  PaginaRestablecer,
  PaginaPerfil,
  PaginaAdmin,
} from './pages/paginas.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<RutaPublica><PaginaLogin /></RutaPublica>} />
          <Route path="/registro" element={<RutaPublica><PaginaRegistro /></RutaPublica>} />
          <Route path="/recuperar-password" element={<RutaPublica><PaginaRecuperar /></RutaPublica>} />
          <Route path="/restablecer-password" element={<PaginaRestablecer />} />
          <Route path="/cambiar-password" element={<RutaCambioObligatorio><PaginaCambioPassword /></RutaCambioObligatorio>} />
          <Route path="/perfil" element={<RutaProtegida><PaginaPerfil /></RutaProtegida>} />
          <Route path="/admin" element={<RutaProtegida><PaginaAdmin /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
