import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../logo.png';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}
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
const panelIzq = { flex: 1, background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'white' };
const panelDer = { flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 };
const caja = { width: '100%', maxWidth: 380 };
const input = { width: '100%', padding: '12px 14px', margin: '6px 0', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const boton = { width: 'auto', padding: '10px 24px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 12 };
const link = { color: '#2563eb', textDecoration: 'none', fontSize: 13 };
const titulo = { fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111827' };
const subtitulo = { fontSize: 13, color: '#6b7280', marginBottom: 20 };
const tagline = { marginTop: 24, fontSize: 15, fontWeight: 500, textAlign: 'center', maxWidth: 320 };
const legal = { marginTop: 16, fontSize: 10, color: '#ffffff', textAlign: 'center', maxWidth: 400, lineHeight: 1.5 };
const botonVolver = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer', textDecoration: 'none', marginTop: 16 };

export function PaginaRegistro() {
  const navegar = useNavigate();
  const esMovil = useMediaQuery('(max-width: 768px)');
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '', confirmarPassword: '' });
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      await registrarApi(form.nombre.trim(), form.apellido.trim(), form.correo.trim(), form.password);
      setMensaje('Su contraseña temporal fue registrada correctamente. Por favor, cambie su contraseña temporal por una nueva.');
      setTimeout(() => navegar('/cambiar-password', { replace: true }), 2000);
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
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verPassword ? 'text' : 'password'} placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setVerPassword(!verPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verConfirmar ? 'text' : 'password'} placeholder="Confirmar contraseña" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} required />
              <button type="button" onClick={() => setVerConfirmar(!verConfirmar)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verConfirmar ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            {error ? <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p> : null}
            {mensaje ? <p style={{ color: '#059669', fontSize: 13 }}>{mensaje}</p> : null}
            <button style={boton} disabled={cargando}>{cargando ? 'Registrando…' : 'Crear cuenta'}</button>
          </form>
          <Link style={botonVolver} to="/login">
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
    <div style={{ ...layoutSplit, ...(esMovil ? { flexDirection: 'column' } : {}) }}>
      <div style={{ ...panelIzq, ...(esMovil ? { padding: '30px 20px' } : {}) }}>
        {logoImg}
        <p style={tagline}>Tus procesos más eficientes, seguros y sin fricciones.</p>
        <p style={legal}>Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.</p>
      </div>
      <div style={panelDer}>
        <div style={caja}>
          <h1 style={titulo}>Inicia sesión en tu cuenta de AdamoServices</h1>
          <p style={subtitulo}>Ingresa tus credenciales a continuación para continuar:</p>
          <form onSubmit={enviar}>
            <input style={input} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setVerPassword(!verPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            {error ? <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p> : null}
            <p style={{ margin: '4px 0' }}><Link style={link} to="/recuperar-password">¿Olvidaste tu contraseña? Haz click aquí</Link></p>
            <button style={boton} disabled={cargando}>{cargando ? 'Ingresando…' : 'Iniciar sesión'}</button>
          </form>
          <Link style={botonVolver} to="/registro">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
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
    <div style={{ ...layoutSplit, ...(esMovil ? { flexDirection: 'column' } : {}) }}>
      <div style={{ ...panelIzq, ...(esMovil ? { padding: '30px 20px' } : {}) }}>
        {logoImg}
        <p style={tagline}>Tus procesos más eficientes, seguros y sin fricciones.</p>
        <p style={legal}>Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.</p>
      </div>
      <div style={panelDer}>
        <div style={caja}>
          <h1 style={titulo}>Cambiar contraseña</h1>
          <p style={subtitulo}>Si tu contraseña es temporal, este paso es obligatorio.</p>
          <form onSubmit={enviar}>
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verPassword ? 'text' : 'password'} placeholder="Contraseña actual o temporal" value={form.passwordActual} onChange={(e) => setForm({ ...form, passwordActual: e.target.value })} required />
              <button type="button" onClick={() => setVerPassword(!verPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verNueva ? 'text' : 'password'} placeholder="Nueva contraseña" value={form.nuevaPassword} onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })} required />
              <button type="button" onClick={() => setVerNueva(!verNueva)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verNueva ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input style={{ ...input, paddingRight: 40 }} type={verConfirmar ? 'text' : 'password'} placeholder="Confirmar nueva contraseña" value={form.confirmarPassword} onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })} required />
              <button type="button" onClick={() => setVerConfirmar(!verConfirmar)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}>
                {verConfirmar ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
            {error ? <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p> : null}
            {ok ? <p style={{ color: '#059669', fontSize: 13 }}>{ok}</p> : null}
            <button style={boton} disabled={cargando}>{cargando ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
          </form>
          <Link style={botonVolver} to="/admin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Hacer más tarde
          </Link>
        </div>
      </div>
    </div>
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
    <div style={{ ...layoutSplit, ...(esMovil ? { flexDirection: 'column' } : {}) }}>
      <div style={{ ...panelIzq, ...(esMovil ? { padding: '30px 20px' } : {}) }}>
        {logoImg}
        <p style={tagline}>Tus procesos más eficientes, seguros y sin fricciones.</p>
        <p style={legal}>Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.</p>
      </div>
      <div style={panelDer}>
        <div style={caja}>
          <h1 style={titulo}>Recuperar contraseña</h1>
          <p style={subtitulo}>Ingresa tu correo para recibir instrucciones:</p>
          <form onSubmit={enviar}>
            <input style={input} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            {mensaje ? <p style={{ color: '#059669', fontSize: 13 }}>{mensaje}</p> : null}
            <button style={boton} disabled={cargando}>{cargando ? 'Enviando…' : 'Enviar instrucciones'}</button>
          </form>
          <Link style={botonVolver} to="/login">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver al login
          </Link>
        </div>
      </div>
    </div>
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
      <Link style={botonVolver} to="/login">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Ir a iniciar sesión
      </Link>
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
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link style={botonVolver} to="/cambiar-password">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Cambiar contraseña
        </Link>
        <Link style={botonVolver} to="/admin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Ir al panel
        </Link>
      </div>
      <button style={{ ...boton, background: '#6b7280', marginTop: 8 }} onClick={salir} type="button">Cerrar sesión</button>
    </main>
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
  const { cerrarSesion, requiereCambioPassword } = useAuth();
  const navegar = useNavigate();
  const esMovil = useMediaQuery('(max-width: 768px)');

  const servicios = [
    { nombre: 'Adamo Pay', desc: 'Gestión de pagos', clientes: 3827, color: '#10b981' },
    { nombre: 'Adamo Id', desc: 'Verificación de identidad', clientes: 9411, color: '#3b82f6' },
    { nombre: 'Adamo Risk', desc: 'Reducción de riesgos', clientes: 793, color: '#8b5cf6' },
    { nombre: 'Adamo Sign', desc: 'Firma de documentos', clientes: 2738, color: '#1e40af' },
  ];

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  if (esMovil) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f3f4f6' }}>
        <div style={{ background: '#0a0e1a', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={logo} alt="Logo" width={28} height={28} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Link style={{ color: '#fff', fontSize: 13, textDecoration: 'none' }} to="/cambiar-password">Contraseña</Link>
            <button onClick={salir} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>Salir</button>
          </div>
        </div>
        <main style={{ padding: 20 }}>
          {requiereCambioPassword && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: '#92400e' }}>Su contraseña expirará en 1 día. Por favor, cámbiela ahora.</span>
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Clientes</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {servicios.map((s) => (
              <div key={s.nombre} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{s.nombre}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.desc}</div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginTop: 8 }}>{s.clientes.toLocaleString()} clientes</div>
                <button style={{ marginTop: 12, padding: '10px 16px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%' }}>Gestionar clientes</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      <aside style={sidebar}>
        <div style={sidebarLogo}>
          <img src={logo} alt="Logo" width={32} height={32} />
        </div>
        <nav style={sidebarMenu}>
          <a style={sidebarItem} href="#inicio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </a>
          <a style={sidebarItemActive} href="#clientes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Clientes
          </a>
          <Link style={sidebarItem} to="/cambiar-password">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Cambiar contraseña
          </Link>
        </nav>
        <div style={sidebarFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>U</div>
            <span style={{ fontSize: 13 }}>Mi perfil</span>
          </div>
          <button onClick={salir} style={{ ...sidebarItem, width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={mainArea}>
        {requiereCambioPassword && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#92400e' }}>Su contraseña expirará en 1 día. Por favor, cámbiela ahora.</span>
            <button onClick={() => navegar('/cambiar-password')} style={{ padding: '8px 16px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cambiar contraseña</button>
          </div>
        )}
        <div style={header}>
          <h1 style={tituloPagina}>Clientes</h1>
          <div style={campana}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={badge}></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Selecciona un servicio para ir a la gestión de clientes. <a href="#servicios" style={{ color: '#2563eb' }}>Ver todos los servicios</a>
          </p>
          <Link style={botonVolver} to="/perfil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Mi perfil
          </Link>
        </div>
        <div style={grid}>
          {servicios.map((s) => (
            <div key={s.nombre} style={{ ...tarjeta, borderBottomColor: s.color }}>
              <div style={tarjetaTitulo}>{s.nombre}</div>
              <div style={tarjetaDesc}>{s.desc}</div>
              <div style={tarjetaClientes}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {s.clientes.toLocaleString()} clientes
              </div>
              <button style={tarjetaBoton}>Gestionar clientes</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
