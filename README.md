# RC Estampa — E-Commerce de Estampado Integral & Drinkware Personalizado

Plataforma e-commerce y estudio digital de personalización y estampado de alta gama para todo tipo de productos: **ropa textil (poleras, polerones, camisas, chaquetas)**, **drinkware (vasos, termos, tazas, botellas térmicas)** y **merchandising corporativo**. 

Integra catálogo facetado con filtros reactivos, carrito persistente, checkout seguro con pasarela de pagos, sistema de cotizaciones B2B, **editor interactivo sobre canvas** (*Fabric.js*), **panel de administración avanzado con métricas y exportación a Excel**, y una **suite completa de SEO & AI-Readiness** con soporte nativo para **Modo Light y Dark**.

Arquitectura monorepo desacoplada: **React 18 + TypeScript** en frontend, **Django 5 + Django REST Framework** en backend, **PostgreSQL** y orquestación con **Docker**.

---

## 🚀 Stack Tecnológico

| Capa | Tecnologías | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | SPA modular con tipado estricto y renderizado ultra rápido. |
| **Estilos & UI** | Bootstrap 5, SCSS Tokens, Lucide React | Sistema de diseño de alta gama con soporte nativo Light / Dark. |
| **Estado Global** | Zustand (`persist`) | Manejo de carrito de compras, sesión de usuario y tema visual. |
| **Diseñador Canvas** | Fabric.js (HTML5 Canvas) | Editor interactivo de personalización con carga de capas, logos y texto. |
| **Validaciones** | React Hook Form + Zod | Formularios tipados con validación de esquemas en tiempo real. |
| **Backend API** | Django 5, Django REST Framework | API RESTful robusta, autenticación SimpleJWT y permisos por rol. |
| **Procesamiento** | Pillow, OpenPyXL, django-filter | Optimización de imágenes, exportación de catálogos a Excel y filtrado. |
| **Base de Datos** | PostgreSQL 16 (Docker) · SQLite (Local) | Persistencia relacional optimizada con índices y migraciones continuas. |
| **Infraestructura** | Docker, Docker Compose, Nginx | Multi-stage build para frontend, proxy inverso y aislamiento de red. |

---

## 💎 Módulos y Funcionalidades Destacadas

### 1. Portada Interactiva con Efecto Cover Flow 3D
- Carrusel de productos destacados con **perspectiva tridimensional** (`perspective: 1100px`, `transform-style: preserve-3d`), rotación dinámica en el eje Y y navegación fluida por clic, controles táctiles y selector de puntos.
- Módulos de confianza: barra de estadísticas de despacho y calidad, ticker infinito de técnicas y manifiesto de marca con orbe holográfico.

### 2. Editor de Diseño Interactivo sobre Canvas
- Personalización en tiempo real sobre prendas y drinkware.
- Herramientas de texto enriquecido, selección tipográfica, paleta de colores, carga de logotipos / vectores y lápiz de dibujo.
- Cálculo de cotización en vivo y guardado de proyectos exportables.

### 3. Catálogo Facetado con Filtros Dinámicos
- **Líneas & Colecciones Reales:** Sincronización directa desde base de datos (`/api/lineas/`).
- **Filtro de Precio 'Entre' (Desde / Hasta):** Casillas numéricas editables con presets rápidos (`< $15k`, `$15k - $30k`, `$30k - $50k`, `> $50k`) y filtrado reactivo.
- **Scrollbar Independiente:** Barra lateral con desplazamiento interno para navegar fácilmente filtros extensos sin depender del scroll de la página.
- Filtros por categorías, tallas con stock disponible, colores y materiales.

### 4. Panel de Control y Administración Integral
- **Dashboard de Estadísticas:** Métricas clave en tiempo real (volumen de ventas, pedidos activos, alertas de stock bajo y ticket promedio).
- **CRUD de Ropa & Drinkware:** Creación y edición con modal instantáneo, control de múltiples variantes (talla, color, stock, SKU) y galería de fotos.
- **Gestión de Líneas y Colecciones:** Creación, edición y eliminación de líneas con regla de seguridad (al menos 1 línea activa) y reasignación automática a *"Ropa sin categoría"*.
- **Exportación a Excel Corporativo:** Generación automatizada de reportes `.xlsx` con paleta corporativa y hojas organizadas por categoría para ropa y drinkware.
- **Trazabilidad de Pedidos:** Modal interactivo para actualizar estados de pedidos con historial de auditoría y notas internas.

### 5. Checkout y Pasarela de Pagos
- Carrito de compras persistente con cálculo automático de totales.
- Flujo de compra con soporte para **MercadoPago** y **Transferencia Bancaria**.
- Seguimiento de pedidos con código único de tracking y notificaciones por correo/WhatsApp.

### 6. Sistema de Diseño Dual (Light / Dark)
- Arquitectura de variables y tokens SCSS accesibles con alto contraste para insignias, tipografías y contenedores.
- Conmutador instantáneo sin recarga con persistencia en `localStorage`.

### 7. Suite Completa de SEO & AI-Readiness
- **Hook [`useSEO.ts`](frontend/src/hooks/useSEO.ts):** Metadatos dinámicos por vista y canonical tags automáticas.
- **Datos Estructurados Schema.org:** `LocalBusiness`, `FAQPage` y marcado semántico de productos para Google Rich Snippets.
- **Estándar para Agentes de IA:** Archivo [`llms.txt`](frontend/public/llms.txt), `robots.txt` optimizado y `sitemap.xml` automatizado.

---

## 📁 Estructura del Monorepo

```
.
├── frontend/                     # SPA React 18 + TypeScript + Vite
│   ├── public/
│   │   ├── Logo_RCEstampa.png    # Logotipo oficial de la marca
│   │   ├── robots.txt            # Directivas de rastreo SEO y bots de IA
│   │   ├── sitemap.xml           # Mapa del sitio XML indexable
│   │   └── llms.txt              # Estándar para indexación por LLMs y agentes IA
│   ├── src/
│   │   ├── api/                  # Clientes Axios tipados y hooks asíncronos
│   │   ├── components/           # Layout, Diseñador Canvas, Filtros y Badges
│   │   ├── hooks/                # Hooks personalizados (useSEO, useIntersectionObserver)
│   │   ├── pages/                # Landing, Catalogo, Drinkware, Disenador, Panel, Checkout
│   │   ├── store/                # Stores Zustand (cartStore, authStore, themeStore)
│   │   ├── styles/               # theme.scss (tokens de color Light/Dark y estilos)
│   │   └── types/                # Interfaces TypeScript sincronizadas con DRF
│   ├── Dockerfile                # Multi-stage build (Node Alpine -> Nginx Alpine)
│   └── nginx.conf                # Fallback SPA + proxy inverso a /api, /media y /admin
├── backend/                      # API Django 5 + Django REST Framework
│   ├── config/                   # Configuración global, URLs, settings y seguridad
│   ├── cuentas/                  # Gestión de usuarios, autenticación JWT y roles
│   ├── catalogo/                 # Modelos, vistas, filtros y exportación Excel (Ropa/Drinkware)
│   ├── pedidos/                  # Órdenes, ítems de compra y checkout
│   ├── disenos/                  # Almacenamiento de diseños generados en canvas
│   ├── manage.py, requirements.txt, Dockerfile, entrypoint.sh
├── docker-compose.yml            # Orquestación de contenedores (DB Postgres, Backend, Frontend)
├── .env.example                  # Plantilla de variables de entorno
└── .github/workflows/ci.yml      # Pipeline de Integración Continua (CI/CD)
```

---

## ⚙️ Inicio Rápido con Docker

Con Docker y Docker Compose instalados:

```bash
# 1. Clonar el repositorio y copiar variables de entorno
cp .env.example .env

# 2. Construir e iniciar los servicios en segundo plano
docker compose up --build -d
```

El contenedor de backend ejecutará automáticamente las migraciones, recolectará estáticos y sembrará el catálogo inicial:

- **Frontend / Tienda Web:** `http://localhost:8088`
- **API REST Pública:** `http://localhost:8088/api/lineas/`
- **Panel de Administración:** `http://localhost:8088/panel`
- **Django Admin:** `http://localhost:8088/admin/`

### Crear Cuenta Administrador
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 🌐 Despliegue en Servidor VPS

Para desplegar en un servidor VPS junto a otros proyectos:

1. **Aislamiento de Puertos:** Únicamente el contenedor `frontend` (Nginx) expone puerto hacia el exterior (por defecto `8088`); `backend` y `db` operan en la red privada interna de Docker.
2. **Variables de Entorno (`.env`):**
   ```env
   FRONTEND_PORT=8088
   DEBUG=False
   SECRET_KEY=tu_clave_secreta_de_produccion
   ALLOWED_HOSTS=localhost,127.0.0.1,backend,tu_dominio.cl,ip_del_servidor
   CSRF_TRUSTED_ORIGINS=http://localhost:8088,https://tu_dominio.cl,http://ip_del_servidor:8088
   CORS_ALLOWED_ORIGINS=http://localhost:8088,https://tu_dominio.cl,http://ip_del_servidor:8088
   ```
3. **Reconstrucción y Actualización en Servidor:**
   ```bash
   git pull origin main
   docker compose build frontend backend
   docker compose up -d
   ```

---

## 🛠️ Desarrollo Local (Sin Docker)

### Backend (Django)
```bash
cd backend
python -m venv .venv
# En Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalogo
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev # Disponible en http://localhost:5173 (con proxy inverso a :8000)
```

---

## 📋 Comandos y Scripts de Validación

* **Frontend:**
  * `npm run dev`: Servidor de desarrollo con Hot Module Replacement (HMR).
  * `npm run build`: Compilación optimizada para producción con Vite.
  * `npm run typecheck`: Verificación estricta de tipos (`tsc --noEmit`).
  * `npx eslint . --quiet`: Análisis estático de código sin advertencias.
* **Backend:**
  * `python manage.py migrate`: Ejecución de migraciones de base de datos.
  * `python manage.py test`: Ejecución de pruebas unitarias automatizadas.
  * `python manage.py seed_catalogo`: Carga del catálogo inicial predeterminado.
