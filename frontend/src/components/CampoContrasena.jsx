import { useState } from 'react';

export function CampoContrasena({ placeholder, value, onChange, label }) {
  const [ver, setVer] = useState(false);
  const id = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <div style={{ position: 'relative', margin: '6px 0' }}>
      {label && <label htmlFor={id} style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 4 }}>{label}</label>}
      <input
        id={id}
        style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
        type={ver ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        aria-label={label || placeholder}
      />
      <button
        type="button"
        onClick={() => setVer(!ver)}
        aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{ position: 'absolute', right: 10, top: label ? '60%' : '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}
      >
        {ver ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        )}
      </button>
    </div>
  );
}
