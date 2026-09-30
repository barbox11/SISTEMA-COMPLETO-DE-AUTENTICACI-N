import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutSplit } from '../components/LayoutSplit.jsx';
import { CampoContrasena } from '../components/CampoContrasena.jsx';
import { Boton } from '../components/Boton.jsx';
import { Icono } from '../components/Icono.jsx';
import { PanelAdmin } from '../components/PanelAdmin.jsx';
import {
  cambiarPassword as cambiarPasswordApi,
  solicitarRecuperacion as solicitarRecuperacionApi,
  restablecerPassword as restablecerPasswordApi,
  obtenerPerfil as obtenerPerfilApi,
  registrar as registrarApi,
} from '../services/authService.js';
import { actualizarPerfil as actualizarPerfilApi } from '../services/userService.js';

const caja = { width: '100%', maxWidth: 380 };
const input = { width: '100%', padding: '12px 14px', margin: '6px 0', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const boton = { width: 'auto', padding: '10px 24px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 12 };
const link = { color: '#2563eb', textDecoration: 'none', fontSize: 13 };
const titulo = { fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111827' };
const subtitulo = { fontSize: 13, color: '#6b7280', marginBottom: 20 };
const botonVolver = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer', textDecoration: 'none', marginTop: 16 };

export function PaginaRegistro() {
  const navegar = useNavigate();
  const esMovil = useMediaQuery('(max-width: 768px)');
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
      await registrarApi(form.nombre.trim(), form.apellido.trim(), form.correo.trim());
      setMensaje('Usuario registrado correctamente. Revisa tu correo para obtener tu contraseña temporal.');
      setTimeout(() => navegar('/iniciar-sesion', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible registrar el usuario.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ ...layoutSplit, ...(esMovil ? { flexDirection: 'column' } : {}) }}>
      <div style={{ ...panelIzq, ...(esMovil ? { padding: '30px 20px' } : {}) }}>
        {logoImg}
        <p style={tagline}>Tus procesos más eficientes, seguros y sin fricciones.</p>
        <p style={legal}>Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.</p>
      </div>
      <div style={panelDer}>
        <div style={caja}>
          <h1 style={titulo}>Crear cuenta</h1>
          <p style={subtitulo}>Ingresa tus datos para registrarte:</p>
          <form onSubmit={enviar}>
            <input style={input} placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <input style={input} placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
            <input style={input} type="email" placeholder="Correo electrónico" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
            {error ? <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p> : null}
            {mensaje ? <p style={{ color: '#059669', fontSize: 13 }}>{mensaje}</p> : null}
            <button style={boton} disabled={cargando}>{cargando ? 'Registrando…' : 'Crear cuenta'}</button>
          </form>
          <Link style={botonVolver} to="/iniciar-sesion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const esMovil = useMediaQuery('(max-width: 768px)');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await iniciarSesion(correo.trim(), password);
      navegar(res.requiereCambioPassword ? '/cambiar-password' : '/admin', { replace: true });
    } catch (err) {
      if (err.response?.data?.codigo === 'PASSWORD_EXPIRED') {
        setError('Su contraseña temporal ha expirado. Debe renovarla.');
      } else {
        setError(err.response?.data?.mensaje || 'No fue posible iniciar sesión.');
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <LayoutSplit>
      <div style={caja}>
        <h1 style={titulo}>Inicia sesión en tu cuenta de AdamoServices</h1>
        <p style={subtitulo}>Ingresa tus credenciales a continuación para continuar:</p>
        <form onSubmit={enviar}>
          <input style={input} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required aria-label="Correo electrónico" />
          <CampoContrasena placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} label="Contraseña" />
          {error ? <p role="alert" className="error-text">{error}</p> : null}
          <p style={{ margin: '4px 0' }}><Link style={link} to="/recuperar-password">¿Olvidaste tu contraseña? Haz click aquí</Link></p>
          <Boton type="submit" disabled={cargando}>{cargando ? 'Ingresando…' : 'Iniciar sesión'}</Boton>
        </form>
        <Link style={botonVolver} to="/registro">
          <Icono nombre="volver" /> Crear cuenta
        </Link>
      </div>
    </LayoutSplit>
  );
}

export function PaginaCambioPassword() {
  const { marcarPasswordActualizada } = useAuth();
  const navegar = useNavigate();
  const esMovil = useMediaQuery('(max-width: 768px)');
  const [form, setForm] = useState({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' });
  const [verPassword, setVerPassword] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
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
      setTimeout(() => navegar('/admin', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible cambiar la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <LayoutSplit>
      <div style={caja}>
        <h1 style={titulo}>Cambiar contraseña</h1>
        <p style={subtitulo}>Si tu contraseña es temporal, este paso es obligatorio.</p>
        <form onSubmit={enviar}>
          <CampoContrasena placeholder="Contraseña actual o temporal" value={form.passwordActual} onChange={(e) => setForm({ ...form, passwordActual: e.target.value })} label="Contraseña actual" />
          <CampoContrasena placeholder="Nueva contraseña" value={form.nuevaPassword} onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })} label="Nueva contraseña" />
          <CampoContrasena placeholder="Confirmar nueva contraseña" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} label="Confirmar contraseña" />
          {error ? <p role="alert" className="error-text">{error}</p> : null}
          {ok ? <p className="success-text">{ok}</p> : null}
          <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar nueva contraseña'}</Boton>
        </form>
        <Link style={botonVolver} to="/admin">
          <Icono nombre="volver" /> Hacer más tarde
        </Link>
      </div>
    </LayoutSplit>
  );
}

export function PaginaRecuperar() {
  const esMovil = useMediaQuery('(max-width: 768px)');
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
    <LayoutSplit>
      <div style={caja}>
        <h1 style={titulo}>Recuperar contraseña</h1>
        <p style={subtitulo}>Ingresa tu correo para recibir instrucciones:</p>
        <form onSubmit={enviar}>
          <input style={input} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required aria-label="Correo electrónico" />
          {mensaje ? <p className="success-text">{mensaje}</p> : null}
          <Boton type="submit" disabled={cargando}>{cargando ? 'Enviando…' : 'Enviar instrucciones'}</Boton>
        </form>
        <Link style={botonVolver} to="/iniciar-sesion">
          <Icono nombre="volver" /> Volver al login
        </Link>
      </div>
    </LayoutSplit>
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
    <LayoutSplit>
      <div style={caja}>
        <h1 style={titulo}>Restablecer contraseña</h1>
        <form onSubmit={enviar}>
          <input style={input} placeholder="Token del correo" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} aria-label="Token" />
          <CampoContrasena placeholder="Nueva contraseña" value={form.nuevaPassword} onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })} label="Nueva contraseña" />
          <CampoContrasena placeholder="Confirmar" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} label="Confirmar contraseña" />
          {mensaje ? <p role="alert" className="error-text">{mensaje}</p> : null}
          <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando…' : 'Restablecer'}</Boton>
        </form>
        <Link style={botonVolver} to="/iniciar-sesion">
          <Icono nombre="volver" /> Ir a iniciar sesión
        </Link>
      </div>
    </LayoutSplit>
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
    try {
      const res = await obtenerPerfilApi();
      setPerfil(res.datos);
      setNombre(res.datos.nombre || '');
      setApellido(res.datos.apellido || '');
    } catch (err) {
      setPerfil({});
    }
  }

  useEffect(() => {
    if (!perfil) cargar();
  }, [perfil]);

  if (!perfil) {
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
    navegar('/iniciar-sesion', { replace: true });
  }

  return (
    <LayoutSplit>
      <div style={caja}>
        <h1 style={titulo}>Mi perfil</h1>
        <p><strong>{perfil.nombre} {perfil.apellido}</strong> — {perfil.correo} ({perfil.rol})</p>
        <form onSubmit={guardar}>
          <input style={input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" aria-label="Nombre" />
          <input style={input} value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" aria-label="Apellido" />
          <Boton type="submit">Actualizar datos</Boton>
        </form>
        {mensaje ? <p className="success-text">{mensaje}</p> : null}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Link style={botonVolver} to="/cambiar-password">
            <Icono nombre="volver" /> Cambiar contraseña
          </Link>
          <Link style={botonVolver} to="/admin">
            <Icono nombre="volver" /> Ir al panel
          </Link>
        </div>
        <Boton variant="danger" onClick={salir} type="button">Cerrar sesión</Boton>
      </div>
    </LayoutSplit>
  );
}

const sidebar = { width: 240, background: '#0a0e1a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 10, overflowY: 'auto' };
const sidebarLogo = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 8px' };
const sidebarMenu = { flex: 1 };
const sidebarItem = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const sidebarItemActive = { ...sidebarItem, background: '#1f2937', color: '#fff' };
const sidebarFooter = { borderTop: '1px solid #1f2937', paddingTop: 16, marginTop: 16 };
const mainArea = { marginLeft: 240, flex: 1, background: '#f3f4f6', minHeight: '100vh', padding: 32, boxSizing: 'border-box' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const tituloPagina = { fontSize: 24, fontWeight: 700, color: '#111827' };
const campana = { position: 'relative', cursor: 'pointer', padding: 8 };
const badge = { position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 };
const tarjeta = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '4px solid', display: 'flex', flexDirection: 'column', gap: 12 };
const tarjetaTitulo = { fontSize: 16, fontWeight: 700, color: '#111827' };
const tarjetaDesc = { fontSize: 13, color: '#6b7280' };
const tarjetaClientes = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500 };
const tarjetaBoton = { marginTop: 'auto', padding: '10px 16px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'center' };

export function PaginaAdmin() {
  return <PanelAdmin />;
}
