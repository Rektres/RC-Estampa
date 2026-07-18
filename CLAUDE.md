# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Arquitectura general

Monorepo de RC Estampa (e-commerce chileno de ropa/drinkware estampado con editor de diseño). Dos apps desacopladas + Docker:

- `frontend/` — SPA **Vite + React 18 + TypeScript**, **Bootstrap 5** (react-bootstrap + SCSS), Zustand, react-router v7, react-hook-form + zod, fabric.js (editor de diseño).
- `backend/` — API **Django 5 + Django REST Framework**, auth **JWT** (simplejwt), **PostgreSQL** (SQLite como fallback local), Pillow (media), whitenoise (static del admin).
- Raíz — `docker-compose.yml` (db + backend + frontend/nginx), `.env` / `.env.example`, `.github/workflows/ci.yml`.

En runtime el nginx del frontend sirve el SPA y proxea `/api/`, `/media/`, `/admin/`, `/static/` al backend (gunicorn). Todo el dominio y la UI están en **español** (rutas, copy, campos: `talla`, `linea`, `destacado`, `precio_oferta`).

## Comandos

Frontend (`cd frontend`):
- `npm run dev` — dev server (proxya `/api` y `/media` a `http://localhost:8000`, ver `vite.config.ts`)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit -p tsconfig.app.json`
- No hay test runner configurado.

Backend (`cd backend`, con venv o Docker):
- `python manage.py migrate` / `makemigrations`
- `python manage.py seed_catalogo` — carga el catálogo inicial desde `catalogo/seed_data.json`
- `python manage.py test` — tests (aún no hay tests propios)
- `python manage.py runserver` — dev server en `:8000`

Stack completo: `docker compose up --build` (requiere `.env` — copiar de `.env.example`). App en `http://localhost`, API en `http://localhost/api`, admin en `http://localhost/admin`.

## Backend (`backend/`)

- `config/` — settings/urls/wsgi + `pagination.py` (PageNumberPagination con `page_size` override, `max_page_size=200`). Settings usa **django-environ**: si hay `POSTGRES_DB` en el entorno usa Postgres, si no SQLite. Lee `.env` de `backend/` y de la raíz.
- Apps: `cuentas` (User custom con login por email + `rol`, `DireccionEnvio`), `catalogo` (`Producto`/`VarianteProducto`/`ImagenProducto`, análogos `ProductoVajilla`/`VarianteVajilla`/`ImagenVajilla`, `Categoria`, `FotoCliente`, y config del editor `ColorEditor`/`PrecioEditor`/`TallaStandard`/`Region`), `pedidos` (`Pedido`+`ItemPedido`, `Cotizacion`, `Carrito`+`ItemCarrito`), `disenos` (`Diseno`: recibe el PNG base64 del canvas y lo guarda como archivo en `/media/`).
- **AUTH_USER_MODEL = `cuentas.User`** (definido desde la primera migración; no cambiar sin recrear migraciones).
- Endpoints bajo `/api/`: `productos/`, `drinkware/` (list con filtros `linea,categoria,talla,color,material,precio_max,q` + `ordering` + paginación; detalle por `slug`), `categorias/`, `fotos-clientes/`, `editor/` (colores+precios+tallas+regiones), `auth/{register,token,token/refresh,me,direcciones}/`, `pedidos/` (POST checkout → genera `numero` RC-########, GET por `numero`), `cotizaciones/`, `carrito/` (GET/PUT), `disenos/` (POST base64).
- **Panel admin** bajo `/api/panel/` (permiso `IsAdminRol` de `cuentas/permissions.py` — `rol == 'admin'` o staff; `createsuperuser` ya asigna rol admin): `panel/productos/` y `panel/drinkware/` (ModelViewSet completo, **incluye inactivos**, lookup por pk, serializers de escritura con nested `variantes`/`imagenes` en estrategia replace-all y slug autogenerado si va vacío), `panel/categorias/` (delete con `ProtectedError` → 400), `panel/upload/` (multipart, guarda en `media/productos/` y devuelve `{url}`). `ImagenProducto.imagen`/`ImagenVajilla.imagen` son `CharField` (aceptan URL externa o ruta `/media/...`). Tests en `catalogo/tests.py` cubren todo el panel — correr con `POSTGRES_DB=` vacío para forzar SQLite si el `.env` raíz apunta a Postgres.
- El seed vive en `catalogo/seed_data.json`; imágenes de catálogo son URLs de Pexels (campo `URLField`, no se descargan).

## Frontend (`frontend/src/`)

- **Estilos**: `styles/theme.scss` importa Bootstrap con overrides de marca ($primary dorado `#C9A84C`, radios, fuentes) y define las clases de marca que Bootstrap no trae: `bg/text/border-{surface,card,elevated,border,text,muted,ghost,urban,formal,drinkware}`, variantes de opacidad `bg-primary-{8,10,20,30}` / `border-primary-{20,30,40}` (equivalen a `bg-primary/20` de Tailwind), `font-italiana`/`font-montserrat`, y `.btn-primary`/`.btn-secondary` (outline dorado) tematizados. Tema oscuro global vía `data-bs-theme="dark"` en `index.html`. **No hay Tailwind** (migrado). Fuentes self-hosted vía `@fontsource` (importadas en `main.tsx`).
- **API**: `src/api/client.ts` (instancia axios, `baseURL = VITE_API_URL || '/api'`, interceptor que adjunta el JWT y refresca en 401), `src/api/index.ts` (servicios tipados: `catalogoApi`, `authApi`, `pedidosApi`, `cotizacionesApi`, `disenosApi`, `carritoApi`), `src/api/hooks.ts` (`useAsync`). Las páginas consumen la API con `useAsync`; el catálogo trae todo (`page_size=200`) y filtra/ordena/pagina client-side. **No queda `mockData`**.
- **Tipos** (`src/types/index.ts`): contrato compartido con los serializers del backend — mantener a mano en sincronía (no hay codegen). `Linea = 'urbana'|'formal'|'drinkware'`. `CartItem` es unión discriminada por `tipo` (`'catalogo'` vs `'diseno'`).
- **Estado** (Zustand + persist localStorage): `cartStore` (`rc-estampa-cart`, ítems del carrito — client-side; el endpoint `/api/carrito` existe pero no está cableado al UI), `authStore` (`rc-estampa-auth`, guarda `user` + tokens `access`/`refresh`, con `login/setAccess/logout`).
- **Editor de diseño** (`pages/DisenadorEditor`): canvas fabric.js con siluetas SVG inline generadas por `getProductSVG` (fondo no seleccionable, `bgRef`), undo/redo por snapshots JSON (`historyRef`/`historyIndexRef`) disparados por eventos `object:added|modified|removed` — cualquier mutación nueva del canvas debe pasar por `saveHistory()`. Al agregar al carrito sube el PNG a `/api/disenos/` y guarda la URL de media.
- **Formularios**: react-hook-form + zod (`@hookform/resolvers/zod`). Seguir ese patrón. En los forms del panel los campos numéricos se modelan como **strings validados con regex** en zod y se convierten con `Number()` en el submit (evita fricción de tipos con `z.coerce`).
- **Panel de administración** (`pages/Panel/`, rutas `/panel`, `/panel/:tipo/nuevo`, `/panel/:tipo/:id` con `tipo ∈ ropa|drinkware`): protegido por `RequireAdmin` (`components/shared/RequireAdmin.tsx`, redirige si `user.rol !== 'admin'`); el link "Panel" del Navbar solo aparece para admins. **La ruta NO puede llamarse `/admin`** — nginx la proxea al admin de Django. `index.tsx` (tabs Ropa/Drinkware/Categorías + tabla con toggle activo y delete con confirmación), `ProductoForm.tsx` (form único parametrizado por tipo, `useFieldArray` para variantes/imágenes, upload vía `panelApi.upload`), `Categorias.tsx` (CRUD inline).

## Deploy / Docker

- `backend/Dockerfile` (python:3.12-slim, gunicorn; `entrypoint.sh` corre migrate + collectstatic + seed). `frontend/Dockerfile` (multi-stage node:20 build → nginx:alpine con `nginx.conf`: fallback SPA `try_files … /index.html` + proxy a backend).
- `.gitattributes` fuerza **LF** en `*.sh` (evita que `entrypoint.sh` falle con CRLF en el contenedor).
- Volumen `media` compartido: el backend escribe los PNG de diseño y el nginx del frontend los sirve en `/media/`.
- El pago (checkout) es un **stub** (sin pasarela real). Precios de diseños personalizados quedan "a cotizar".
