import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../logo.png';
import {
  cambiarPassword as cambiarPasswordApi,
  solicitarRecuperacion as solicitarRecuperacionApi,
  restablecerPassword as restablecerPasswordApi,
  obtenerPerfil as obtenerPerfilApi,
  registrar as registrarApi,
} from '../services/authService.js';
import { actualizarPerfil as actualizarPerfilApi } from '../services/userService.js';

const logoImg = <img src={logo} alt="Logo" width={120} height={120} />;

const layoutSplit = { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' };
const panelIzq = { flex: 1, background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 40px', color: 'white' };
const panelDer = { flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 };
const caja = { width: '100%', maxWidth: 380 };
const input = { width: '100%', padding: '12px 14px', margin: '6px 0', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const boton = { width: 'auto', padding: '10px 24px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 12 };
const link = { color: '#2563eb', textDecoration: 'none', fontSize: 13 };
const titulo = { fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111827' };
const subtitulo = { fontSize: 13, color: '#6b7280', marginBottom: 20 };
const tagline = { marginTop: 32, fontSize: 15, fontWeight: 500, textAlign: 'center', maxWidth: 320 };
const legal = { fontSize: 10, color: '#ffffff', textAlign: 'center', maxWidth: 400, lineHeight: 1.5 };

export function PaginaRegistro() {
  const navegar = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      const res = await registrarApi(form.nombre.trim(), form.apellido.trim(), form.correo.trim());
      setMensaje(`${res.mensaje} Contraseña temporal: ${res.passwordTemporal}`);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible registrar el usuario.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={caja}>
      <h1>Crear cuenta</h1>
      <form onSubmit={enviar}>
        <input style={input} placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input style={input} placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
        <input style={input} type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
        {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}
        {mensaje ? <p style={{ color: '#059669' }}>{mensaje}</p> : null}
        <button style={boton} disabled={cargando}>{cargando ? 'Registrando…' : 'Crear cuenta'}</button>
      </form>
      <p><Link to="/login">Volver al login</Link></p>
    </main>
  );
}

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
    <div style={layoutSplit}>
      <div style={panelIzq}>
        <div style={{ textAlign: 'center' }}>
          {logoImg}
          <p style={tagline}>Tus procesos más eficientes, seguros y sin fricciones.</p>
        </div>
        <p style={legal}>Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.</p>
      </div>
      <div style={panelDer}>
        <div style={caja}>
          <h1 style={titulo}>Inicia sesión en tu cuenta de AdamoServices</h1>
          <p style={subtitulo}>Ingresa tus credenciales a continuación para continuar:</p>
          <form onSubmit={enviar}>
            <input style={input} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <input style={input} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p> : null}
            <p style={{ margin: '4px 0' }}><Link style={link} to="/recuperar-password">¿Olvidaste tu contraseña? Haz click aquí</Link></p>
            <button style={boton} disabled={cargando}>{cargando ? 'Ingresando…' : 'Iniciar sesión'}</button>
          </form>
          <p style={{ marginTop: 16 }}><Link style={link} to="/registro">Crear cuenta</Link></p>
        </div>
      </div>
    </div>
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
