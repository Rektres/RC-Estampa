# RC Estampa

Tienda e-commerce de ropa y drinkware estampado, con catálogo, carrito, checkout, cotizaciones de pedidos personalizados y un **editor de diseño** sobre canvas (fabric.js).

Monorepo desacoplado: **React + TypeScript** (frontend) · **Django + DRF** (backend) · **PostgreSQL** · empaquetado con **Docker**.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | Vite, React 18, TypeScript, Bootstrap 5 (react-bootstrap + SCSS), Zustand, React Router 7, react-hook-form + Zod, fabric.js |
| Backend | Django 5, Django REST Framework, SimpleJWT (auth), django-filter, Pillow, gunicorn, whitenoise |
| Datos | PostgreSQL (Docker) · SQLite (fallback local) |
| Infra | Docker, docker-compose, Nginx, GitHub Actions (CI) |

## Estructura

```
.
├── frontend/            # SPA React + TS
│   ├── src/
│   │   ├── api/         # cliente axios + servicios tipados + hooks
│   │   ├── components/  # layout y componentes compartidos
│   │   ├── pages/       # una carpeta por ruta
│   │   ├── store/       # Zustand (carrito, auth)
│   │   ├── styles/      # theme.scss (Bootstrap + tema de marca)
│   │   └── types/       # contrato de tipos con el backend
│   ├── Dockerfile       # build node → nginx
│   └── nginx.conf       # fallback SPA + proxy a /api, /media, /admin
├── backend/             # API Django + DRF
│   ├── config/          # settings, urls, pagination
│   ├── cuentas/ catalogo/ pedidos/ disenos/   # apps
│   ├── manage.py  requirements.txt  Dockerfile  entrypoint.sh
├── docker-compose.yml   # db + backend + frontend
├── .env.example
└── .github/workflows/ci.yml
```

## Requisitos

- **Docker** (opción recomendada), o bien
- **Node 20+** y **Python 3.12+** para desarrollo local.

## Inicio rápido (Docker)

Con Docker Desktop corriendo, desde la raíz:

```bash
cp .env.example .env        # ajusta SECRET_KEY y DEBUG para producción
docker compose up --build
```

El backend migra, siembra el catálogo y arranca solo. Luego:

- App: **http://localhost**
- API: **http://localhost/api/productos/**
- Admin: **http://localhost/admin**

Crear un usuario administrador:

```bash
docker compose exec backend python manage.py createsuperuser
```

Detener: `docker compose down` (agrega `-v` para borrar base de datos y media).

## Desarrollo local (sin Docker)

**Backend** (usa SQLite si no hay variables `POSTGRES_*` en el entorno):

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalogo
python manage.py runserver     # http://localhost:8000
```

**Frontend** (en otra terminal):

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173 (proxya /api y /media a :8000)
```

Abre **http://localhost:5173**.

> El backend no tiene vista en `/`; la tienda se sirve desde el frontend. `:8000` solo responde en `/api/`, `/admin/`, `/media/` y `/static/`.

## Variables de entorno

Ver `.env.example`. Claves principales:

| Variable | Descripción |
|----------|-------------|
| `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` | Configuración de Django |
| `POSTGRES_DB/USER/PASSWORD/HOST/PORT` | Conexión Postgres (si faltan, Django usa SQLite) |
| `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` | Orígenes del frontend |
| `VITE_API_URL` | URL del API que consume el SPA (por defecto `/api`) |

## API

Bajo `/api/`:

- `GET productos/`, `GET productos/{slug}/` — catálogo de ropa (filtros: `linea, categoria, talla, color, precio_max, q, ordering`)
- `GET drinkware/`, `GET drinkware/{slug}/` — catálogo de drinkware
- `GET categorias/`, `GET fotos-clientes/`, `GET editor/` — datos de apoyo
- `POST auth/register/`, `POST auth/token/`, `POST auth/token/refresh/`, `GET auth/me/` — autenticación JWT
- `POST pedidos/`, `GET pedidos/{numero}/` — checkout y confirmación
- `POST cotizaciones/` — solicitudes de pedido personalizado
- `POST disenos/` — sube el PNG generado en el editor
- `GET/PUT carrito/` — carrito persistido (autenticado)

## Scripts útiles

**Frontend** (`cd frontend`): `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck`

**Backend** (`cd backend`): `python manage.py migrate` · `python manage.py seed_catalogo` · `python manage.py test`

## Notas

- El **pago** del checkout es un stub (sin pasarela real); los diseños personalizados quedan "a cotizar".
- Los tipos TS de `frontend/src/types` reflejan a mano los serializers del backend (sin codegen): mantenerlos en sincronía.
- Las imágenes del catálogo son URLs de Pexels; los PNG de diseño se guardan como archivos en `/media/`.
