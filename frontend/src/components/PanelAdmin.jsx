import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Icono } from './Icono.jsx';
import logo from '../logo.png';

export function PanelAdmin() {
  const { cerrarSesion, requiereCambioPassword } = useAuth();
  const navegar = useNavigate();

  const servicios = [
    { nombre: 'Adamo Pay', desc: 'Gestión de pagos', clientes: 3827, color: '#10b981' },
    { nombre: 'Adamo Id', desc: 'Verificación de identidad', clientes: 9411, color: '#3b82f6' },
    { nombre: 'Adamo Risk', desc: 'Reducción de riesgos', clientes: 793, color: '#8b5cf6' },
    { nombre: 'Adamo Sign', desc: 'Firma de documentos', clientes: 2738, color: '#1e40af' },
  ];

  async function salir() {
    await cerrarSesion();
    navegar('/iniciar-sesion', { replace: true });
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: '#0a0e1a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 10, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 8px' }}>
          <img src={logo} alt="Logo" width={32} height={32} />
        </div>
        <nav style={{ flex: 1 }}>
          <a style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }} href="#inicio">
            <Icono nombre="casa" /> Inicio
          </a>
          <a style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: '#1f2937', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }} href="#clientes">
            <Icono nombre="usuario" /> Clientes
          </a>
          <Link style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }} to="/cambiar-password">
            <Icono nombre="candado" /> Cambiar contraseña
          </Link>
        </nav>
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>U</div>
            <span style={{ fontSize: 13 }}>Mi perfil</span>
          </div>
          <button onClick={salir} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, color: '#9ca3af', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <Icono nombre="salir" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, background: '#f3f4f6', minHeight: '100vh', padding: 32, boxSizing: 'border-box' }}>
        {requiereCambioPassword && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#92400e' }}>Su contraseña expirará en 1 día. Por favor, cámbiela ahora.</span>
            <button onClick={() => navegar('/cambiar-password')} style={{ padding: '8px 16px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cambiar contraseña</button>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Clientes</h1>
          <div style={{ position: 'relative', cursor: 'pointer', padding: 8 }}>
            <Icono nombre="campana" />
            <div style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Selecciona un servicio para ir a la gestión de clientes. <a href="#servicios" style={{ color: '#2563eb' }}>Ver todos los servicios</a>
          </p>
          <Link style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13, textDecoration: 'none' }} to="/perfil">
            <Icono nombre="volver" /> Mi perfil
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {servicios.map((s) => (
            <div key={s.nombre} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: `4px solid ${s.color}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{s.nombre}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                <Icono nombre="usuario" /> {s.clientes.toLocaleString()} clientes
              </div>
              <button style={{ marginTop: 'auto', padding: '10px 16px', borderRadius: 6, border: 0, background: '#0a0e1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>Gestionar clientes</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
