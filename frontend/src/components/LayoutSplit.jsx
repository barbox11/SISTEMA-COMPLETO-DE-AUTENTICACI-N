import logo from '../logo.png';

export function LayoutSplit({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'white', minHeight: '100vh' }}>
        <img src={logo} alt="Logo" width={120} height={120} />
        <p style={{ marginTop: 24, fontSize: 15, fontWeight: 500, textAlign: 'center', maxWidth: 320 }}>
          Tus procesos más eficientes, seguros y sin fricciones.
        </p>
        <p style={{ marginTop: 16, fontSize: 10, color: '#ffffff', textAlign: 'center', maxWidth: 400, lineHeight: 1.5 }}>
          Ser un propietario o socio nunca fue tan fácil. Descubre cómo nuestros servicios pueden ayudarte a alcanzar tus metas.
        </p>
      </div>
      <div style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
