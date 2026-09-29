# Sistema Completo de Autenticación Full Stack

Sistema profesional de **registro, inicio de sesión, contraseña temporal obligatoria, cambio, recuperación por correo y control de sesiones**, con backend Node.js + Express + MongoDB (Mongoose), frontend React y Docker.

Todo lo visible al usuario (mensajes, errores, README) está en **español**.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Backend | Node.js 20+, Express 4, Mongoose 8, JWT, bcryptjs, Nodemailer, Helmet, CORS, express-rate-limit, Zod, dotenv |
| Frontend | React 18, Vite 5, React Router 6, Axios, Context API |
| Base de datos | MongoDB 8 (Docker) o MongoDB Atlas |
| Pruebas | Jest + Supertest (+ mongodb-memory-server) |
| Otros | Docker Compose, Postman |

## Arquitectura

```text
./
├── backend/src/
│   ├── config/       # env.js (variables centralizadas), database.js (Mongoose)
│   ├── controllers/  # authController.js, userController.js (delgados)
│   ├── services/     # emailService.js (Nodemailer, sin lógica de negocio mezclada)
│   ├── middlewares/  # auth.js (JWT + cambio obligatorio), errorHandler.js
│   ├── models/       # Usuario.js (passwordHash select:false, índices)
│   ├── routes/       # authRoutes.js, userRoutes.js
│   ├── validators/   # authValidators.js (Zod, separados de controladores)
│   ├── utils/        # errores.js (códigos), asyncHandler.js, generarPassword.js
│   └── templates/emails/ # bienvenida.html, recuperacion.html, cambio-confirmado.html
├── frontend/src/
│   ├── services/  # api.js (Axios+interceptores), authService.js, userService.js
│   ├── context/   # AuthContext.jsx (token, usuario, requiereCambioPassword)
│   ├── routes/    # RutasProtegidas.jsx (protegida, cambio obligatorio, pública)
│   ├── pages/     # paginas.jsx (login, cambio, recuperar, restablecer, perfil)
│   └── hooks/     # useFormulario.js
├── postman/autenticacion.postman_collection.json
├── docker-compose.yml  # MongoDB local (Docker obligatorio según spec)
└── README.md
```

**Decisiones:**
- **Mongoose** (exigido por la especificación) en lugar de Prisma; índice único en `correo`, `passwordHash` con `select:false`.
- **Context API** en lugar de Redux/Zustand: el estado de auth es mínimo y evita dependencias.
- **Zod** para validación separada de controladores.
- **Skills aplicadas:** `vercel-react-best-practices` (imports directos sin barrel, servicios separados, sin componentes inline, interceptores con dedup de sesión) y principios de índices/identificadores de `supabase-postgres-best-practices` trasladados a MongoDB.

## Requisitos

- Node.js 20+ y npm
- Docker Desktop (para MongoDB local) **o** cuenta de MongoDB Atlas
- Git y Postman

## Instalación

```bash
git clone <TU_REPO>
cd "SISTEMA COMPLETO DE AUTENTICACIÓN"

# 1. MongoDB con Docker (obligatorio según especificación)
docker compose up -d
docker ps --filter name=mongo-auth

# 2. Backend
cd backend
cp .env.example .env   # en Windows: Copy-Item .env.example .env
# Edita .env: MONGODB_URI, JWT_SECRET, SMTP_*
npm install
npm run dev            # http://localhost:3000/api/salud

# 3. Frontend (otra terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

## Configuración de MongoDB

### Opción A — Docker (recomendada local)

```bash
docker compose up -d
docker logs mongo-auth
docker exec -it mongo-auth mongosh -u admin -p admin123 --eval "db.adminCommand('ping')"
```

`MONGODB_URI=mongodb://admin:admin123@127.0.0.1:27017/auth_db?authSource=admin`

### Opción B — MongoDB Atlas

1. https://cloud.mongodb.com → crea cluster M0 gratis.
2. Database Access → crea usuario y contraseña.
3. Network Access → permite tu IP o `0.0.0.0/0` (solo desarrollo).
4. Connect → Drivers → Node.js → copia la URI y ponla en `backend/.env`:
```env
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxxx.mongodb.net/auth_db?retryWrites=true&w=majority
```

## Configuración del correo (SMTP genérico)

Funciona con Gmail, Mailtrap, SendGrid o cualquier SMTP. Variables en `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@example.com
SMTP_PASSWORD=tu_clave_de_aplicacion
SMTP_FROM=Sistema de Autenticación <no-reply@example.com>
```

Sin SMTP configurado, el backend **simula** el envío (log en consola) y en desarrollo devuelve `passwordTemporal` / `tokenDesarrollo` en la respuesta para probar sin correo.

## Primer usuario (con Postman)

1. Abre Postman → Import → `postman/autenticacion.postman_collection.json`.
2. Verifica la variable `baseUrl = http://localhost:3000/api`.
3. Ejecuta **AUTH → Registrar usuario** (`POST /api/auth/register`):
```json
{ "nombre": "Juan", "apellido": "Pérez", "correo": "juan@example.com", "rol": "usuario" }
```
4. Copia `passwordTemporal` de la respuesta (o revísala en el correo).
5. Ejecuta **Iniciar sesión** con esa temporal → respuesta con `requiereCambioPassword: true` y `token` (se guarda solo en la variable `token`).
6. Ejecuta **Cambiar contraseña** con la temporal + nueva definitiva.
7. Vuelve a iniciar sesión → `requiereCambioPassword: false` → acceso normal a **Obtener perfil / Actualizar perfil**.

## Flujo completo

```text
REGISTRO → usuario creado (requiereCambioPassword=true, contraseña válida 1 día)
   → LOGIN → /cambiar-password → requiereCambioPassword=false → ACCESO NORMAL (/admin)

OLVIDÉ MI CONTRASEÑA → correo con enlace+token (15 min, un solo uso)
   → nueva contraseña → confirmación por correo → LOGIN

CONTRASEÑA EXPIRADA → login devuelve 403 PASSWORD_EXPIRED → debe renovar
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registra usuario, genera temporal, envía correo |
| POST | `/api/auth/login` | No | Login, informa `requiereCambioPassword` |
| PATCH | `/api/auth/change-password` | Sí | Cambio obligatorio o voluntario |
| POST | `/api/auth/forgot-password` | No | Solicita correo (respuesta genérica) |
| POST | `/api/auth/reset-password` | No | Restablece con token de un solo uso |
| POST | `/api/auth/logout` | Sí | Cierra sesión (cliente descarta token) |
| GET | `/api/auth/perfil` | Sí | Perfil autenticado |
| PATCH | `/api/users/me` | Sí* | Actualiza nombre/apellido (*bloqueado si debe cambiar password) |

Errores consistentes: `{ ok:false, mensaje, codigo }` con HTTP 200/201/400/401/403/404/409/422/429/500/502.

## Testing

```bash
cd backend
npm install   # incluye devDependencies
npm test
```

Cubre: flujo temporal completo, bloqueo de rutas con temporal, credenciales inválidas (401 genérico), registro duplicado (409), recuperación+reset con reuso rechazado, ruta sin token (401).

## Solución de problemas

| Problema | Causa / solución |
|---|---|
| `MongoServerSelectionError` | Docker apagado → inicia Docker Desktop y `docker compose up -d`; o usa Atlas en `.env` |
| `AUTH_TOKEN_EXPIRED` | JWT vencido → inicia sesión de nuevo (`JWT_EXPIRES_IN=1h`) |
| Correo no llega | Revisa SMTP en `.env`; sin SMTP el backend simula y devuelve `passwordTemporal`/`tokenDesarrollo` |
| `403 AUTH_PASSWORD_CHANGE_REQUIRED` | Debes pasar por `/cambiar-password` primero |
| CORS | `FRONTEND_URL` debe ser `http://localhost:5173` |
| Puerto ocupado | Cambia `PORT` en `.env` y `VITE_API_URL` en frontend |

## Licencia

MIT — ver `LICENSE`.
