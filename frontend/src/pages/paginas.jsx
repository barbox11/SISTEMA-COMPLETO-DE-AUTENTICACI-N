import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  cambiarPassword as cambiarPasswordApi,
  solicitarRecuperacion as solicitarRecuperacionApi,
  restablecerPassword as restablecerPasswordApi,
  obtenerPerfil as obtenerPerfilApi,
} from '../services/authService.js';
import { actualizarPerfil as actualizarPerfilApi } from '../services/userService.js';

// NOTA: estilos mínimos inline. Integra aquí tu diseño cuando lo tengas.
const caja = { maxWidth: 420, margin: '40px auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 };
const input = { width: '100%', padding: 10, margin: '8px 0', borderRadius: 8, border: '1px solid #d1d5db' };
const boton = { width: '100%', padding: 12, borderRadius: 8, border: 0, background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };

export function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await iniciarSesion(correo.trim(), password);
      navegar(res.requiereCambioPassword ? '/cambiar-password' : '/perfil', { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={caja}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={enviar}>
        <input style={input} type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <input style={input} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}
        <button style={boton} disabled={cargando}>{cargando ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
      <p><Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link></p>
    </main>
  );
}

export function PaginaCambioPassword() {
  const { marcarPasswordActualizada } = useAuth();
  const navegar = useNavigate();
  const [form, setForm] = useState({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setOk('');
    setCargando(true);
    try {
      const res = await cambiarPasswordApi(form.passwordActual, form.nuevaPassword, form.confirmarPassword);
      setOk(res.mensaje);
      marcarPasswordActualizada();
      setTimeout(() => navegar('/perfil', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible cambiar la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={caja}>
      <h1>Cambiar contraseña</h1>
      <p>Si tu contraseña es temporal, este paso es obligatorio.</p>
      <form onSubmit={enviar}>
        <input style={input} type="password" placeholder="Contraseña actual o temporal" value={form.passwordActual} onChange={(e) => setForm({ ...form, passwordActual: e.target.value })} required />
        <input style={input} type="password" placeholder="Nueva contraseña" value={form.nuevaPassword} onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })} required />
        <input style={input} type="password" placeholder="Confirmar nueva contraseña" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} required />
        {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}
        {ok ? <p style={{ color: '#059669' }}>{ok}</p> : null}
        <button style={boton} disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
      </form>
    </main>
  );
}

export function PaginaRecuperar() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await solicitarRecuperacionApi(correo.trim());
      setMensaje(res.mensaje);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'No fue posible procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={caja}>
      <h1>Recuperar contraseña</h1>
      <form onSubmit={enviar}>
        <input style={input} type="email" placeholder="Tu correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <button style={boton} disabled={cargando}>{cargando ? 'Enviando…' : 'Enviar instrucciones'}</button>
      </form>
      {mensaje ? <p>{mensaje}</p> : null}
      <p><Link to="/login">Volver al login</Link></p>
    </main>
  );
}

export function PaginaRestablecer() {
  const [form, setForm] = useState({ token: '', nuevaPassword: '', confirmarPassword: '' });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setCargando(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const token = form.token || params.get('token') || '';
      const res = await restablecerPasswordApi(token, form.nuevaPassword, form.confirmarPassword);
      setMensaje(res.mensaje);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'No fue posible restablecer la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={caja}>
      <h1>Restablecer contraseña</h1>
      <form onSubmit={enviar}>
        <input style={input} placeholder="Token del correo" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
        <input style={input} type="password" placeholder="Nueva contraseña" value={form.nuevaPassword} onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })} required />
        <input style={input} type="password" placeholder="Confirmar" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} required />
        <button style={boton} disabled={cargando}>{cargando ? 'Guardando…' : 'Restablecer'}</button>
      </form>
      {mensaje ? <p>{mensaje}</p> : null}
      <p><Link to="/login">Ir a iniciar sesión</Link></p>
    </main>
  );
}

export function PaginaPerfil() {
  const { cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargar() {
    const res = await obtenerPerfilApi();
    setPerfil(res.datos);
    setNombre(res.datos.nombre || '');
    setApellido(res.datos.apellido || '');
  }

  if (!perfil) {
    cargar();
    return <main style={caja}><p>Cargando perfil…</p></main>;
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      const res = await actualizarPerfilApi({ nombre, apellido });
      setPerfil(res.datos);
      setMensaje(res.mensaje);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'No fue posible actualizar.');
    }
  }

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <main style={caja}>
      <h1>Mi perfil</h1>
      <p><strong>{perfil.nombre} {perfil.apellido}</strong> — {perfil.correo} ({perfil.rol})</p>
      <form onSubmit={guardar}>
        <input style={input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
        <input style={input} value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />
        <button style={boton} type="submit">Actualizar datos</button>
      </form>
      {mensaje ? <p>{mensaje}</p> : null}
      <p><Link to="/cambiar-password">Cambiar contraseña</Link></p>
      <button style={{ ...boton, background: '#6b7280', marginTop: 8 }} onClick={salir} type="button">Cerrar sesión</button>
    </main>
  );
}
