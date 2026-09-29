# Backend — Sistema de Autenticación

API REST con Express, MongoDB (Mongoose), JWT, bcryptjs y Nodemailer.

## Requisitos
- Node.js 20+
- MongoDB local con Docker o MongoDB Atlas

## Configuración
```bash
cp .env.example .env
# Edita .env con tu MONGODB_URI y SMTP
npm install
```

## Desarrollo
```bash
npm run dev
# http://localhost:3000/api/salud
```

## Endpoints principales
- `POST /api/auth/register` — registra usuario (Postman), genera contraseña temporal
- `POST /api/auth/login` — inicia sesión, informa `requiereCambioPassword`
- `PATCH /api/auth/change-password` — cambia contraseña (JWT)
- `POST /api/auth/forgot-password` — solicita recuperación
- `POST /api/auth/reset-password` — restablece con token
- `POST /api/auth/logout` — cierra sesión
- `GET /api/auth/perfil` — perfil autenticado
- `PATCH /api/users/me` — actualiza nombre/apellido

## Pruebas
```bash
npm test
```
