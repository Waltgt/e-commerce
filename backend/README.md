# Backend - Sistema E-Commerce

API REST del sistema de comercio electrónico (Práctica 2). Node.js + Express + TypeScript + Prisma (MySQL) + Redis.

## Stack

- Node.js 20, TypeScript (`module`/`moduleResolution`: `NodeNext`)
- Express
- Prisma ORM sobre MySQL 8
- Redis: caché de catálogo y lista de bloqueo de usuarios
- JWT: access token (15 min) + refresh token con rotación, hasheado en base de datos
- Zod para validación de entrada
- Multer para subida de imágenes de producto
- Nodemailer (Gmail SMTP) para confirmaciones de pedido, alertas de stock bajo y recuperación de contraseña
- `google-auth-library` para verificar el login con Google
- Swagger UI para documentación interactiva de la API

## Requisitos previos

- Node.js 20 o superior
- Una base de datos MySQL 8 accesible
- Una instancia de Redis accesible

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # completar con valores reales, ver tabla abajo
npx prisma generate
npx prisma migrate dev   # en producción: npx prisma migrate deploy
npx tsx prisma/seed.ts   # pobla roles, estados de pedido/pago y el umbral de stock bajo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión MySQL. En desarrollo local, usa el usuario de migración y apunta a `127.0.0.1` vía reenvío de puertos. En las VMs de producción, usa el usuario de aplicación y la IP interna real de `server-db`. |
| `JWT_ACCESS_SECRET` | Secreto para firmar el access token. |
| `JWT_ACCESS_EXPIRES_IN` | Duración del access token (ej. `15m`). |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token (ej. `7d`). |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Conexión a Redis. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciales OAuth de Google Cloud Console. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD` | Envío de correo vía Gmail (contraseña de aplicación, no la contraseña normal de la cuenta). |
| `FRONTEND_URL` | URL base del frontend, usada para construir el enlace de recuperación de contraseña. |
| `PORT` | Puerto del servidor (por defecto `3000`). |
| `INSTANCE_NAME` | Identificador de la instancia (`api1`, `api2`), visible en `/health` para verificar el balanceo. |

## Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Arranca el servidor con recarga automática (`tsx watch`). |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Ejecuta el build compilado (`node dist/server.js`), usado en producción con PM2. |
| `npm run prisma:generate` | Regenera el cliente de Prisma tras un cambio al schema. |
| `npm run prisma:migrate` | Corre migraciones en desarrollo (`prisma migrate dev`). |
| `npm run prisma:seed` | Puebla los catálogos base. |

## Estructura del proyecto

```
src/
  config/
  lib/              # prisma, redis, jwt, hash, tokenHash, mailer, cache, apiResponse, AppError
  middlewares/       # errorHandler, asyncHandler, auth (requireAuth, requireRole, optionalAuth), upload
  modules/
    auth/            # registro, login local y Google, refresh/logout, recuperación de contraseña
    products/        # catálogo, categorías, imágenes
    cart/
    orders/          # checkout, pago simulado, alerta de stock bajo
    users/           # administración de usuarios (listado, detalle, bloqueo)
    reviews/         # reseñas de cliente + moderación de admin
  docs/
    openapi.json      # especificación de la API, servida por Swagger UI
  server.ts
prisma/
  schema.prisma
  seed.ts
```

## Documentación de la API (Swagger)

Con el servidor corriendo, la documentación interactiva de todos los endpoints está en:

```
http://localhost:3000/api/docs
```

En producción, a través de Nginx: `https://<host>/api/docs`. Cada endpoint muestra método, parámetros, cuerpo esperado, respuestas posibles, y cuáles requieren un token (ícono de candado). Ver `src/docs/openapi.json` para editar o ampliar la especificación.

## Convenciones del proyecto

- Toda respuesta sigue el formato `{ success: true, data }` o `{ success: false, error: { code, message } }`.
- Los errores se centralizan en `middlewares/errorHandler.ts`; los controladores no necesitan `try/catch` propio porque las rutas se envuelven con `asyncHandler`.
- Los catálogos de estado (roles, estados de pedido, métodos y estados de pago) viven en tablas, no en enums de Prisma, para poder agregar valores nuevos sin migración.
- Las contraseñas se hashean con bcrypt. Los tokens de refresh y de recuperación de contraseña se hashean con SHA-256, porque deben buscarse por igualdad exacta en la base (bcrypt no lo permite, al usar salt aleatorio).
- El carrito valida stock al agregar/actualizar y vuelve a validarlo en el checkout, porque el stock puede cambiar entre ambos momentos.

## Despliegue

Gestionado con PM2, Nginx como balanceador y servidor de archivos estáticos del frontend, MySQL y Redis nativos. El procedimiento completo de instalación, configuración de red, backups y solución de problemas está en el documento técnico de arquitectura e infraestructura del proyecto.