# Frontend — Sistema de Autenticación

React + Vite + Axios + React Router. Solo lógica y rutas; el diseño visual se integrará después.

## Configuración
```bash
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

## Rutas
- `/login` — inicio de sesión
- `/cambiar-password` — cambio obligatorio (password temporal) y voluntario
- `/recuperar-password` — solicitar correo de recuperación
- `/restablecer-password?token=...` — restablecer con token
- `/perfil` — perfil protegido, actualizar nombre/apellido, logout

## Estado
`context/AuthContext.jsx` con Context API: token, usuario, `requiereCambioPassword`, logout, expiración.
`services/` separa las peticiones HTTP de los componentes (Axios con interceptores).
