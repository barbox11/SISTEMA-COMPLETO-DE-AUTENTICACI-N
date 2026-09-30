export function Boton({ children, onClick, disabled, type = 'button', variant = 'primary' }) {
  const base = { padding: '10px 24px', borderRadius: 6, border: 0, fontWeight: 600, cursor: 'pointer', fontSize: 14 };
  const variants = {
    primary: { ...base, background: '#0a0e1a', color: '#fff' },
    secondary: { ...base, background: '#fff', color: '#374151', border: '1px solid #d1d5db' },
    danger: { ...base, background: '#6b7280', color: '#fff' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={variants[variant]}>
      {children}
    </button>
  );
}
