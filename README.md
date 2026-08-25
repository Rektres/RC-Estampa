# RC Estampa — Atelier & E-Commerce Escénico

Plataforma e-commerce y atelier digital de estampado textil y drinkware premium. Cuenta con catálogo dinámico con filtros facetados, carrito persistente, checkout, sistema de cotizaciones a medida, **editor de diseño interactivo sobre canvas** (fabric.js), **suite completa de SEO & AI-Readiness** y diseño visual de alta costura con soporte nativo para **Modo Light y Dark**.

Monorepo desacoplado: **React 18 + TypeScript** (frontend) · **Django 5 + DRF** (backend) · **PostgreSQL** · empaquetado y orquestado con **Docker**.

---

## 💎 Características Principales

### 1. Diseño Escénico Luxury & Paleta de Marca
* **Tipografías:** *Italiana* (serif monumental para titulares) y *Montserrat* (sans-serif geométrica para lectura técnica y cuerpo).
* **Componentes Escénicos:**
  * `HeroEscenico`: Titular monumental, micro trust pills, doble llamado a la acción y tarjeta de previsualización de producto con Live Dot.
  * `TrustBar`: Estadísticas clave de producción (24-48h despacho, 50+ lavados garantizados, 100% DTF HD).
  * `MarqueeTicker`: Carrusel orgánico infinito con marcas y técnicas del taller.
  * `PilaresExcelencia`: Grilla de diferenciales de valor y certificaciones ecológicas OEKO-TEX®.
  * `Destacados`: Filtros de catálogo en vivo con tarjetas *Stage Card* y modal de ficha técnica.
  * `ManifiestoEscenico`: Caja editorial con orbe holográfico interactivo.
  * `PlatformPaths`: Recorridos visuales según tipo de audiencia (Streetwear, Corporativo, Drinkware).
  * `GarantiaModulo` & `SocialProof`: Módulo de certificación oficial y mosaico de testimonios.
  * `FAQEscenico`: Acordeón interactivo de preguntas frecuentes con soporte para Schema.org.
  * `LuxuryBoxCotizacion`: Formulario express de cotización B2B integrado en la landing.

### 2. Modo Light / Dark Dinámico
* **Arquitectura de Tokens CSS ([`theme.scss`](frontend/src/styles/theme.scss)):**
  * **Modo Dark:** Obsidiana profundo (`#070814`), azul noche (`#0F1026`), elevación (`#161836`) y acentos dorados luminosos (`#C9A84C`).
  * **Modo Light:** Fondo pergamino alabastro (`#FAF8F5`), tarjetas blanco marfil puro (`#FFFFFF`), elevación beige perla (`#F3EFE6`), textos en tinta obsidiana (`#121324`) y acentos dorados satinados (`#B8933D`).
* **Sincronización:** Zustand store con persistencia en `localStorage` (`rc_theme`) y conmutador Sol/Luna en Navbar para escritorio y móvil.

### 3. Suite SEO, Rich Snippets & AI-Readiness
* **Hook Reactivo [`useSEO.ts`](frontend/src/hooks/useSEO.ts):** Metatítulos dinámicos optimizados para CTR por vista, metadescripciones persuasivas y canonical URLs automáticas.
* **Datos Estructurados Schema.org (JSON-LD):**
  * `LocalBusiness` en [`index.html`](frontend/index.html) con geolocalización, horarios, teléfono y cobertura en Chile.
  * `FAQPage` en [`FAQEscenico.tsx`](frontend/src/pages/Landing/FAQEscenico.tsx) para activar rich snippets (preguntas desplegables) en Google.
* **Estándares Web y Rastreo de IA:**
  * [`robots.txt`](frontend/public/robots.txt): Directivas para Googlebot, Bingbot y crawlers de IA (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
  * [`sitemap.xml`](frontend/public/sitemap.xml): Mapa del sitio XML con todas las URLs públicas y prioridades.
  * [`llms.txt`](frontend/public/llms.txt): Estándar estructurado para indexación contextual por modelos de Inteligencia Artificial (ChatGPT, Claude, Gemini, Perplexity).
* **Manual y Checklist de Auditoría en PDF:** Incluye la [`Guia_Maestra_SEO_CRO_Estandar_Web.pdf`](Guia_Maestra_SEO_CRO_Estandar_Web.pdf) con 27 puntos clave y tabla de verificación imprimible.

### 4. Herramientas CRO & Conversión Móvil
* **Barra Sticky Móvil ([`MobileStickyBar.tsx`](frontend/src/components/layout/MobileStickyBar.tsx)):** Barra inferior fija en celulares con accesos directos (*Diseñar Prenda*, *Catálogo*, *WhatsApp Asesor*).
* **Botón de Compartir ([`ShareButton.tsx`](frontend/src/components/shared/ShareButton.tsx)):** Integración nativa con Web Share API en dispositivos móviles y fallback a WhatsApp / Copiar enlace en escritorio.
* **Open Graph & Twitter Cards:** Previsualización con imagen de portada, título y descripción al compartir en WhatsApp, Instagram, Telegram y redes sociales.

---

## Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Vite, React 18, TypeScript, Bootstrap 5 (react-bootstrap + SCSS), Zustand, React Router 7, react-hook-form + Zod, Lucide React, fabric.js |
| **Backend** | Django 5, Django REST Framework, SimpleJWT (auth), django-filter, Pillow, Gunicorn, WhiteNoise |
| **Base de Datos** | PostgreSQL (Docker) · SQLite (fallback de desarrollo local) |
| **Infraestructura** | Docker, Docker Compose, Nginx (Reverse Proxy & SPA fallback), Tailscale Funnel |

---

## Estructura del Proyecto

```
.
├── frontend/                     # SPA React + TypeScript
│   ├── public/
│   │   ├── Logo_RCEstampa.png    # Logotipo oficial
│   │   ├── robots.txt            # Reglas de rastreo SEO y bots de IA
│   │   ├── sitemap.xml           # Mapa del sitio XML
│   │   └── llms.txt              # Estándar para LLMs y agentes de IA
│   ├── src/
│   │   ├── api/                  # Cliente Axios + servicios tipados + hooks asíncronos
│   │   ├── components/           # Layout (Navbar, Footer, MobileStickyBar) y compartidos
│   │   ├── hooks/                # Hooks personalizados (useSEO)
│   │   ├── pages/                # Landing, Catalogo, Drinkware, Disenador, Personalizado, Panel
│   │   ├── store/                # Zustand (cartStore, authStore, themeStore)
│   │   ├── styles/               # theme.scss (tokens de color Light/Dark y estilos escénicos)
│   │   └── types/                # Interfaces TypeScript sincronizadas con DRF
│   ├── Dockerfile                # Multi-stage build (Node -> Nginx Alpine)
│   └── nginx.conf                # Fallback SPA + proxy a /api, /media, /admin
├── backend/                      # API Django 5 + DRF
│   ├── config/                   # Settings, URLs, paginación y seguridad
│   ├── cuentas/                  # Gestión de usuarios, roles (admin/cliente) y JWT
│   ├── catalogo/                 # Modelos y vistas de Ropa, Drinkware, Variantes e Imágenes
│   ├── pedidos/                  # Pedidos, Carrito y Checkout
│   ├── disenos/                  # Almacenamiento de diseños generados en canvas
│   ├── manage.py, requirements.txt, Dockerfile, entrypoint.sh
├── docker-compose.yml            # Orquestación de db (Postgres), backend y frontend
├── Guia_Maestra_SEO_CRO_Estandar_Web.pdf # Manual de auditoría SEO/CRO en PDF
├── .env.example                  # Plantilla de variables de entorno
└── .github/workflows/ci.yml      # Integración continua
```

---

## Inicio Rápido (Docker)

Con Docker instalado y corriendo:

```bash
# 1. Configurar variables de entorno
cp .env.example .env

# 2. Levantar los contenedores
docker compose up --build -d
```

El backend ejecuta automáticamente las migraciones, realiza el sembrado de catálogo inicial (`seed_catalogo`) y queda operativo:

- **Tienda Web:** `http://localhost:8088` (o la IP/dominio de tu servidor)
- **API REST:** `http://localhost:8088/api/productos/`
- **Panel Web de Administración:** `http://localhost:8088/panel`
- **Django Admin:** `http://localhost:8088/admin/`

### Crear Superusuario Administrador

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Despliegue en Servidor VPS (Sin colisiones de puertos)

Para desplegar en un servidor que ya aloja otros proyectos:

1. **Aislamiento de Puertos:** Solo el servicio `frontend` publica un puerto hacia el host (ej. `8088`); `backend` y `db` quedan en la red interna aislada de Docker.
2. **Configuración en `.env`:**
   ```env
   FRONTEND_PORT=8088
   ALLOWED_HOSTS=localhost,127.0.0.1,backend,<IP_SERVIDOR>,<DOMINIO>
   CSRF_TRUSTED_ORIGINS=http://<IP_SERVIDOR>:8088,https://<DOMINIO>
   CORS_ALLOWED_ORIGINS=http://<IP_SERVIDOR>:8088,https://<DOMINIO>
   ```
3. **Acceso Seguro con Tailscale Funnel (Opcional):**
   ```bash
   tailscale funnel --bg --https=8443 http://127.0.0.1:8088
   ```

---

## Desarrollo Local (Sin Docker)

### Backend (Django)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # En Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalogo
python manage.py runserver      # http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173 (proxya /api y /media a :8000)
```

---

## Scripts Disponibles

* **Frontend:**
  * `npm run dev`: Inicia el servidor de desarrollo local.
  * `npm run build`: Genera el build optimizado de producción en `dist/`.
  * `npm run typecheck`: Validación estricta de tipos TypeScript sin emitir código.
  * `npm run lint`: Análisis estático de código con ESLint.
* **Backend:**
  * `python manage.py migrate`: Aplica las migraciones de base de datos.
  * `python manage.py seed_catalogo`: Carga el catálogo inicial de prendas y drinkware.
  * `python manage.py test`: Ejecuta la suite de pruebas unitarias.
