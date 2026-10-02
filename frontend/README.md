# Frontend - Sistema E-Commerce

Interfaz web en Vue 3 + TypeScript + Vite, consume la API del backend.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vite
- Vue Router 4
- Pinia: `stores/auth.ts` (sesión), `stores/cart.ts` (carrito), `stores/toast.ts` (notificaciones)
- Axios, con interceptor que adjunta el access token y renueva la sesión ante un 401
- Iconify (`@iconify/vue`)
- Google Identity Services, cargado como script externo (`index.html`), sin paquete de npm

## Requisitos previos

- Node.js 20 o superior
- El backend corriendo y accesible

## Instalación

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Variables de entorno

Vite carga un archivo distinto según el modo:

| Archivo | Cuándo se usa | `VITE_API_URL` |
| --- | --- | --- |
| `.env.development` | `npm run dev` | URL absoluta al backend, ej. `http://localhost:3000/api` |
| `.env.production` | `npm run build` | Ruta relativa, `/api` — en producción Nginx sirve el frontend y la API bajo el mismo origen, así que una URL absoluta con otro puerto rompería la conexión |

Ambos archivos necesitan `VITE_GOOGLE_CLIENT_ID` con el Client ID de OAuth de Google Cloud Console. Ninguno de los dos viaja en el repositorio.

## Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera `dist/` para producción, usando `.env.production` |

## Estructura del proyecto

```
src/
  assets/styles/      # tokens.css (paleta, tipografía), base.css
  components/
    base/              # BaseButton, BaseInput, ToastContainer
    product/           # ProductCard
  composables/
    useGoogleSignIn.ts
  lib/                 # api.ts (axios), products.ts, orders.ts, users.ts, reviews.ts
  router/
  stores/              # auth.ts, cart.ts, toast.ts
  views/
    auth/              # Login, Register, ForgotPassword, ResetPassword
    catalog/           # Catalog, ProductDetail
    cart/               # Cart, Checkout
    orders/             # OrderHistory
    admin/              # AdminProducts(+Form), AdminUsers, AdminReviews
```

## Sistema de diseño

Paleta de azules y blanco (variables en `assets/styles/tokens.css`), tipografía Fraunces para encabezados e Inter para cuerpo y UI. Sin decoración que no aporte información: los íconos (Iconify, sets `mdi` y `logos`) se usan para estado o acción, no como adorno.

## Autenticación

El access token vive solo en memoria (store `auth`), nunca en `localStorage`, para reducir la superficie de ataque ante XSS. La sesión se restaura al cargar la aplicación usando la cookie `httpOnly` del refresh token (`tryRestoreSession` en `stores/auth.ts`). Por eso `main.ts` espera esa restauración **antes** de montar el router: si el router arranca primero, una recarga de página en una ruta protegida redirige a `/login` aunque la sesión siga siendo válida.

## Login con Google

El origen desde el que se sirve el frontend debe estar en **Orígenes autorizados de JavaScript** de las credenciales OAuth, en Google Cloud Console — tanto el de desarrollo (`http://localhost:5173`) como el de producción (el dominio u origen real donde quede publicado). Sin esto, Google responde `origin_mismatch` al intentar iniciar sesión.

## Build para producción

```bash
npm run build
```

Genera `dist/`, que Nginx sirve como archivos estáticos junto con el proxy hacia `/api/`. El procedimiento completo de despliegue está en el documento técnico de arquitectura e infraestructura del proyecto.