# RC Estampa — E-Commerce de Estampado Integral & Drinkware Personalizado

[![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django_REST-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Fabric.js](https://img.shields.io/badge/Fabric.js-Canvas_Engine-FF6F00?style=for-the-badge)](http://fabricjs.com/)

Plataforma e-commerce completa y estudio digital de personalización y estampado de alta gama para todo tipo de productos: **ropa textil (poleras, polerones, camisas, chaquetas)**, **drinkware (vasos térmicos, tazas, botellas)** y **merchandising corporativo**.

🌐 **Demostración y Vitrina en Producción:** [https://rektres.github.io/RC-Estampa/](https://rektres.github.io/RC-Estampa/)

---

## 🏛 Arquitectura del Sistema

El sistema implementa una arquitectura monorepo desacoplada y contenerizada sobre **Docker Compose**, asegurando portabilidad, escalabilidad y consistencia de entornos:

```text
                                  ┌─────────────────────────── RC ESTAMPA ──────────────────────────┐
                                  │                                                                 │
[Navegador / Cliente] ──▶ Nginx Reverse Proxy (:80 / :443) ──┬──▶ Frontend React 18 + TS (SPA)
                                                             │
                                                             └──▶ API Django REST (:8000) ──▶ PostgreSQL 16 (:5432)
                                                                        │
                                                                        ├──▶ Generación de Mockups & Canvas (Fabric.js)
                                                                        └──▶ Exportador Analítico Excel (openpyxl)
```

### Componentes Clave:
1. **Frontend SPA (React 18 + TypeScript + Vite):**
   * Catálogo facetado y reactivo con filtrado dinámico multicriterio (categoría, técnica de estampado, rangos de precio).
   * Carrito de compras con persistencia local (`localStorage`) y validación de stock en tiempo real.
   * Flujo de checkout estructurado para pedidos retail y cotizaciones B2B mayoristas.
   * Soporte integral para **Modo Claro (Light) y Oscuro (Dark)**.

2. **Estudio de Personalización Interactivo (Canvas HTML5 / Fabric.js):**
   * Editor visual donde los clientes pueden diseñar en tiempo real sobre prendas y artículos.
   * Funcionalidades: subida de archivos gráficos, tipografías personalizables, herramientas de alineación, rotación, escalado milimétrico y previsualización de mockups.

3. **Backend API REST (Python 3.12 + Django 5 + Django REST Framework):**
   * Modelos relacionales normalizados para gestión de `cuentas`, `catalogo`, `pedidos` y `disenos`.
   * Motor de cálculo automático de costos según técnica de impresión (DTF, vinilo, sublimación, serigrafía) y volumen de prendas.
   * Sistema de cotizaciones para clientes mayoristas.

4. **Panel de Administración y Métricas:**
   * Dashboard con indicadores de ventas, pedidos y productos más demandados.
   * Módulo de reportes analíticos con exportación directa a hojas de cálculo Excel (`.xlsx`).

---

## ✨ Características Destacadas

* 🎨 **Editor Interactivo de Estampados:** Diseña y personaliza prendas en un lienzo interactivo con exportación digital de alta resolución.
* 🛍️ **E-Commerce Completo:** Navegación por líneas de producto, variantes de color/talla, carrito persistente y generación de comprobantes de pedido.
* 💼 **Módulo B2B / Mayorista:** Cotizador especializado para empresas e instituciones con escala de descuentos por volumen.
* 📊 **Panel Administrativo:** Control de inventario, cambio de estados de pedido y descarga de reportes comerciales.
* 🚀 **Suite SEO & Rendimiento:** Metadatos Open Graph, Twitter Cards y arquitectura semántica optimizada para motores de búsqueda.

---

## 🛠 Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Fabric.js (HTML5 Canvas) |
| **Backend** | Python 3.12, Django 5.1, Django REST Framework, Gunicorn, Pillow, openpyxl |
| **Base de Datos** | PostgreSQL 16 (Relacional con soporte ACID) |
| **Infraestructura** | Docker, Docker Compose, Nginx Reverse Proxy |
| **Calidad de Código** | ESLint, TypeScript Strict, Django Test Runner, GitHub Actions CI |

---

## 🔒 Confidencialidad y Código Propietario

> [!NOTE]
> El código fuente y la implementación interna de esta plataforma son de carácter **privado y confidencial**, al tratarse de una solución de software propietaria desplegada en producción.
>
> Este repositorio se mantiene público como **vitrina técnica de arquitectura y diseño de software**.

---

## 🌐 Visita el Proyecto en Vivo

Para explorar la plataforma y la experiencia interactiva:

👉 **[https://rektres.github.io/RC-Estampa/](https://rektres.github.io/RC-Estampa/)**
