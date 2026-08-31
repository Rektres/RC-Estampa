import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const DEFAULT_OPTIONS = {
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    scrollTo: { behavior: 'smooth' as const, block: 'center' as const },
    classes: 'shepherd-luxury-tour',
  },
};

/**
 * 1. Tour Exhaustivo del Panel según Pestaña Activa (Español Latinoamericano)
 */
export function startPanelTabTour(tab: 'estadisticas' | 'ropa' | 'drinkware' | 'categorias' | 'lineas') {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // Paso Inicial: Cabecera Principal
  tour.addStep({
    id: 'tab-header',
    title: 'Panel de Control Principal',
    text: '¡Bienvenido al administrador de <strong>RC Estampa</strong>! Desde acá puedes controlar tus ventas, actualizar existencias, crear productos y organizar todo tu catálogo fácilmente.',
    attachTo: {
      element: '#tour-panel-header',
      on: 'bottom',
    },
    buttons: [
      {
        text: 'Omitir',
        classes: 'shepherd-button-secondary',
        action: () => tour.cancel(),
      },
      {
        text: 'Empezar recorrido →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // Paso 2: Conmutador de Pestañas
  tour.addStep({
    id: 'tab-navigation',
    title: 'Navegación entre Módulos',
    text: 'Usa estas pestañas para moverte rápidamente entre <strong>Estadísticas & Ventas</strong>, <strong>Ropa Textil</strong>, <strong>Colección Drinkware</strong>, <strong>Categorías</strong> y <strong>Líneas</strong>.',
    attachTo: {
      element: '#tour-panel-tabs',
      on: 'bottom',
    },
    buttons: [
      {
        text: '← Anterior',
        classes: 'shepherd-button-secondary',
        action: () => tour.back(),
      },
      {
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  if (tab === 'estadisticas') {
    // 1. Selector de Período
    if (document.querySelector('#tour-stats-period-selector')) {
      tour.addStep({
        id: 'stats-period-step',
        title: 'Filtro por Período',
        text: 'Selecciona el rango de tiempo que deseas analizar: <em>Todo el historial</em>, <em>Últimos 7 días</em>, <em>Últimos 30 días</em>, <em>Este mes</em> o <em>Este año</em>.',
        attachTo: {
          element: '#tour-stats-period-selector',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 2. Exportar a Excel
    if (document.querySelector('#tour-stats-export-excel')) {
      tour.addStep({
        id: 'stats-export-step',
        title: 'Exportar Reporte a Excel',
        text: 'Descarga un libro de Excel (.xlsx) completo con múltiples hojas: resumen general de ventas, lista detallada de pedidos y desglose por producto.',
        attachTo: {
          element: '#tour-stats-export-excel',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 3. KPI Ventas Brutas
    if (document.querySelector('#tour-stats-kpi-bruto')) {
      tour.addStep({
        id: 'stats-kpi-bruto-step',
        title: 'Ventas Totales Brutas',
        text: 'Muestra la suma total de dinero recaudado por todas las compras aprobadas y pagadas en el período elegido.',
        attachTo: {
          element: '#tour-stats-kpi-bruto',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 4. KPI Ventas Netas
    if (document.querySelector('#tour-stats-kpi-neto')) {
      tour.addStep({
        id: 'stats-kpi-neto-step',
        title: 'Ingreso Neto Líquido',
        text: 'Tu dinero real a recibir: el monto total de ventas restando automáticamente las comisiones retenidas por MercadoPago y pasarelas.',
        attachTo: {
          element: '#tour-stats-kpi-neto',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 5. KPI Comisiones MP
    if (document.querySelector('#tour-stats-kpi-mp')) {
      tour.addStep({
        id: 'stats-kpi-mp-step',
        title: 'Comisiones de Pasarela',
        text: 'Detalle de los cobros y costos por procesamiento de pagos con tarjeta y pasarela de MercadoPago.',
        attachTo: {
          element: '#tour-stats-kpi-mp',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 6. KPI Ticket Promedio & Conversión
    if (document.querySelector('#tour-stats-kpi-ticket')) {
      tour.addStep({
        id: 'stats-kpi-ticket-step',
        title: 'Ticket Promedio & Conversión',
        text: 'Conoce el valor promedio que gasta cada cliente en tu tienda y el porcentaje de carritos que completaron exitosamente su compra.',
        attachTo: {
          element: '#tour-stats-kpi-ticket',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 7. Embudo de Estados
    if (document.querySelector('#tour-stats-funnel')) {
      tour.addStep({
        id: 'stats-funnel-step',
        title: 'Embudo de Pedidos por Estado',
        text: 'Haz clic en cualquiera de las tarjetas de estado (<em>Pendiente</em>, <em>Pagado</em>, <em>En Proceso</em>, <em>Enviado</em>, <em>Entregado</em>) para filtrar la lista de pedidos al instante. ¡Puedes seleccionar más de uno a la vez!',
        attachTo: {
          element: '#tour-stats-funnel',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 8. Ranking de Productos Más Vendidos
    if (document.querySelector('#tour-stats-top-products')) {
      tour.addStep({
        id: 'stats-top-step',
        title: 'Top Productos Más Vendidos',
        text: 'Descubre qué prendas y artículos generan más ventas y unidades comercializadas, con barras de progreso visuales y buscador integrado.',
        attachTo: {
          element: '#tour-stats-top-products',
          on: 'top',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 9. Ventas por Línea y Métodos de Pago
    if (document.querySelector('#tour-stats-sales-line')) {
      tour.addStep({
        id: 'stats-line-step',
        title: 'Ventas por Línea & Métodos de Pago',
        text: 'Revisa el rendimiento comercial de cada línea de producto y la distribución de pagos entre MercadoPago y Transferencia bancaria directa.',
        attachTo: {
          element: '#tour-stats-sales-line',
          on: 'top',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 10. Modo de Carga de Pedidos
    if (document.querySelector('#tour-stats-orders-mode')) {
      tour.addStep({
        id: 'stats-orders-mode-step',
        title: 'Modo de Visualización de Pedidos',
        text: 'Elige cómo navegar tus pedidos: en <strong>Modo Paginado</strong> (5, 10, 25 o 50 filas) o en <strong>Modo Continuo (Lazy Load)</strong>.',
        attachTo: {
          element: '#tour-stats-orders-mode',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 11. Buscador de Pedidos
    if (document.querySelector('#tour-stats-orders-search')) {
      tour.addStep({
        id: 'stats-orders-search-step',
        title: 'Buscador de Pedidos',
        text: 'Encuentra cualquier orden rápidamente escribiendo el número de pedido, nombre del cliente, correo electrónico o teléfono.',
        attachTo: {
          element: '#tour-stats-orders-search',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 12. Filtro de Fechas de Pedidos
    if (document.querySelector('#tour-stats-orders-date')) {
      tour.addStep({
        id: 'stats-orders-date-step',
        title: 'Filtro por Rango de Fechas',
        text: 'Filtra las órdenes por fechas específicas como <em>Hoy</em>, <em>Últimos 7 días</em>, <em>Este mes</em> o seleccionando un rango de fechas personalizado.',
        attachTo: {
          element: '#tour-stats-orders-date',
          on: 'top',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 13. Tabla de Pedidos y Expedientes
    if (document.querySelector('#tour-stats-orders')) {
      tour.addStep({
        id: 'stats-orders-step',
        title: 'Tabla de Pedidos y Trazabilidad',
        text: 'Acá ves el listado completo de órdenes. Haz clic en el botón de ojo 👁️ para abrir el <strong>Expediente del Pedido</strong>, cambiar su estado de taller o revisar notas internas.',
        attachTo: {
          element: '#tour-stats-orders',
          on: 'top',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: '¡Entendido! Finalizar ✓',
            classes: 'shepherd-button-primary',
            action: () => tour.complete(),
          },
        ],
      });
    }
  } else if (tab === 'ropa' || tab === 'drinkware') {
    const tipoLabel = tab === 'ropa' ? 'Prendas Textiles' : 'Artículos Drinkware';

    // 1. Botón Nuevo Producto
    if (document.querySelector('#tour-btn-nuevo-producto')) {
      tour.addStep({
        id: 'cat-nuevo-step',
        title: `Crear Nuevo Producto (${tipoLabel})`,
        text: `Presiona acá para agregar un nuevo ítem a tu catálogo. Podrás configurar tallas, colores, stock por bodega, precios y fotos en alta resolución.`,
        attachTo: {
          element: '#tour-btn-nuevo-producto',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 2. Exportar Catálogo Excel
    if (document.querySelector('#tour-btn-export-excel')) {
      tour.addStep({
        id: 'cat-export-step',
        title: 'Exportar Catálogo a Excel',
        text: 'Genera un archivo Excel (.xlsx) profesional con todos tus productos organizados por categoría, ideal para cotizaciones a clientes y control de existencias.',
        attachTo: {
          element: '#tour-btn-export-excel',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 3. Buscador de Productos
    if (document.querySelector('#tour-catalog-search')) {
      tour.addStep({
        id: 'cat-search-step',
        title: 'Buscador Inteligente',
        text: 'Escribe el nombre del producto, la categoría o la línea para filtrar tus productos en tiempo real.',
        attachTo: {
          element: '#tour-catalog-search',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 4. Conmutador de Vistas
    if (document.querySelector('#tour-catalog-view-toggle')) {
      tour.addStep({
        id: 'cat-view-step',
        title: 'Vista en Lista o Tarjetas',
        text: 'Alterna entre la vista compacta en <strong>Lista / Tabla</strong> o la vista visual en <strong>Tarjetas (Cards)</strong> según lo que te sea más cómodo.',
        attachTo: {
          element: '#tour-catalog-view-toggle',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 5. Filtro por Categoría
    if (document.querySelector('#tour-catalog-filter-categoria')) {
      tour.addStep({
        id: 'cat-filter-cat-step',
        title: 'Filtrar por Categoría',
        text: 'Filtra tus productos según su categoría asignada (por ejemplo: Polerones, Poleras, Tazas, Botellas, etc.).',
        attachTo: {
          element: '#tour-catalog-filter-categoria',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 6. Filtro por Estado
    if (document.querySelector('#tour-catalog-filter-estado')) {
      tour.addStep({
        id: 'cat-filter-status-step',
        title: 'Filtrar por Estado',
        text: 'Visualiza únicamente productos <em>Activos</em> (visibles para el público) o productos <em>Ocultos / Deshabilitados</em>.',
        attachTo: {
          element: '#tour-catalog-filter-estado',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 7. Filtro por Stock
    if (document.querySelector('#tour-catalog-filter-stock')) {
      tour.addStep({
        id: 'cat-filter-stock-step',
        title: 'Filtrar por Disponibilidad',
        text: 'Encuentra rápidamente productos con existencias disponibles o aquellos que están <em>Agotados (0 stock)</em> para reponerlos.',
        attachTo: {
          element: '#tour-catalog-filter-stock',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 8. Filtro por Características
    if (document.querySelector('#tour-catalog-filter-features')) {
      tour.addStep({
        id: 'cat-filter-feat-step',
        title: 'Filtrar por Características Especiales',
        text: 'Filtra productos marcados como <em>★ Destacados en portada</em>, <em>✨ Nuevos lanzamientos</em> o <em>🏷️ En oferta</em>.',
        attachTo: {
          element: '#tour-catalog-filter-features',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 9. Tabla de Productos y Acciones
    if (document.querySelector('#tour-catalog-table')) {
      tour.addStep({
        id: 'cat-table-step',
        title: 'Administración de Productos',
        text: 'En cada fila puedes hacer clic en el lápiz para <strong>editar datos y variantes</strong>, usar el interruptor para <strong>activar/ocultar</strong> o eliminar el ítem.',
        attachTo: {
          element: '#tour-catalog-table',
          on: 'top',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: '¡Entendido! Finalizar ✓',
            classes: 'shepherd-button-primary',
            action: () => tour.complete(),
          },
        ],
      });
    }
  } else if (tab === 'categorias') {
    // 1. Cabecera y Botón Nueva Categoría
    if (document.querySelector('#tour-categorias-header')) {
      tour.addStep({
        id: 'cat-header-step',
        title: 'Gestión de Categorías',
        text: 'Acá puedes organizar la estructura de tu catálogo. Usa el botón <strong>"Nueva Categoría"</strong> para crear una clasificación y asignarla a una línea.',
        attachTo: {
          element: '#tour-categorias-header',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 2. Buscador de Categorías
    if (document.querySelector('#tour-categorias-search')) {
      tour.addStep({
        id: 'cat-search-mgmt-step',
        title: 'Buscador de Categorías',
        text: 'Busca categorías por su nombre o identificador único para editarlas rápidamente.',
        attachTo: {
          element: '#tour-categorias-search',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 3. Filtro por Líneas
    if (document.querySelector('#tour-categorias-filter-linea')) {
      tour.addStep({
        id: 'cat-filter-line-step',
        title: 'Filtro por Línea Asignada',
        text: 'Filtra las categorías para ver únicamente las que pertenecen a una línea o colección específica.',
        attachTo: {
          element: '#tour-categorias-filter-linea',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 4. Contenedor de Categorías
    tour.addStep({
      id: 'cat-mgmt-step',
      title: 'Tarjetas de Categorías',
      text: 'Cada tarjeta te indica la línea asociada y cuántos productos tiene vinculados. Puedes editar su nombre o eliminarla de forma segura.',
      attachTo: {
        element: '#tour-categorias-container',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Entendido! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  } else if (tab === 'lineas') {
    // 1. Cabecera y Botón Nueva Línea
    if (document.querySelector('#tour-lineas-header')) {
      tour.addStep({
        id: 'lineas-header-step',
        title: 'Gestión de Líneas y Colecciones',
        text: 'Las líneas representan tus grandes colecciones de marca (ej. Urbana, Deportiva, Drinkware). Usa el botón <strong>"Nueva Línea"</strong> para crear una nueva.',
        attachTo: {
          element: '#tour-lineas-header',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 2. Buscador de Líneas
    if (document.querySelector('#tour-lineas-search')) {
      tour.addStep({
        id: 'lineas-search-step',
        title: 'Buscador de Colecciones',
        text: 'Encuentra cualquier línea rápidamente escribiendo su nombre.',
        attachTo: {
          element: '#tour-lineas-search',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Siguiente →',
            classes: 'shepherd-button-primary',
            action: () => tour.next(),
          },
        ],
      });
    }

    // 3. Contenedor de Líneas y Reglas de Seguridad
    tour.addStep({
      id: 'lineas-mgmt-step',
      title: 'Colecciones y Regla de Seguridad',
      text: 'Siempre debe existir al menos 1 línea activa. Si eliminas una línea, sus productos se transferirán automáticamente a la línea protegida <em>"Ropa sin categoría"</em> para no perderlos.',
      attachTo: {
        element: '#tour-lineas-container',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Entendido! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  }

  tour.start();
}

/**
 * 2. Tour Guiado del Modal de Producto (Ropa & Drinkware)
 */
export function startProductoModalTour(esRopa: boolean) {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // 1. Cabecera del Formulario
  tour.addStep({
    id: 'modal-prod-header',
    title: `Ficha del Producto (${esRopa ? 'Prenda Textil' : 'Drinkware'})`,
    text: 'Acá configuras todos los datos comerciales, fotos, variantes de color/talla y existencias de este producto.',
    attachTo: {
      element: '#tour-modal-prod-header',
      on: 'bottom',
    },
    buttons: [
      {
        text: 'Omitir',
        classes: 'shepherd-button-secondary',
        action: () => tour.cancel(),
      },
      {
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // 2. Nombre
  if (document.querySelector('#tour-modal-prod-nombre')) {
    tour.addStep({
      id: 'modal-prod-nombre-step',
      title: 'Nombre del Producto',
      text: 'Escribe el nombre comercial oficial que verán tus clientes en la tienda (ej. "Polerón Canguro Oversize Felpa").',
      attachTo: {
        element: '#tour-modal-prod-nombre',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 3. Slug URL
  if (document.querySelector('#tour-modal-prod-slug')) {
    tour.addStep({
      id: 'modal-prod-slug-step',
      title: 'Identificador URL (Slug)',
      text: 'Se genera de forma automática con el nombre. Es el enlace web amigable para compartir tu producto y optimizarlo en Google.',
      attachTo: {
        element: '#tour-modal-prod-slug',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 4. Descripción
  if (document.querySelector('#tour-modal-prod-desc')) {
    tour.addStep({
      id: 'modal-prod-desc-step',
      title: 'Descripción & Detalles',
      text: 'Indica los detalles de confección, tipo de tela, técnicas de estampado (DTF, vinilo, serigrafía) o especificaciones de cuidado.',
      attachTo: {
        element: '#tour-modal-prod-desc',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 5. Categoría
  if (document.querySelector('#tour-modal-prod-categoria')) {
    tour.addStep({
      id: 'modal-prod-cat-step',
      title: 'Categoría',
      text: 'Selecciona la categoría a la que pertenece este ítem para que los clientes lo encuentren en los filtros de la tienda.',
      attachTo: {
        element: '#tour-modal-prod-categoria',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 6. Línea / Colección
  if (document.querySelector('#tour-modal-prod-linea')) {
    tour.addStep({
      id: 'modal-prod-line-step',
      title: 'Línea o Colección',
      text: 'Asigna el producto a una de tus líneas activas para agruparlo en la portada y en los reportes de ventas.',
      attachTo: {
        element: '#tour-modal-prod-linea',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 7. Precios
  if (document.querySelector('#tour-modal-prod-precios')) {
    tour.addStep({
      id: 'modal-prod-prices-step',
      title: 'Precios & Descuentos',
      text: 'Ingresa el <strong>Precio Normal</strong> en pesos chilenos. Si deseas aplicar una rebaja, ingresa el <strong>Precio Oferta</strong> y la tienda mostrará el descuento automáticamente.',
      attachTo: {
        element: '#tour-modal-prod-precios',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 8. Toggles de Visibilidad
  if (document.querySelector('#tour-modal-prod-toggles')) {
    tour.addStep({
      id: 'modal-prod-toggles-step',
      title: 'Visibilidad y Destacados',
      text: 'Marca si el producto está <em>Activo</em> para comprarse, si debe aparecer en la sección <em>★ Destacados de Portada</em> o con la insignia de <em>✨ Nuevo Lanzamiento</em>.',
      attachTo: {
        element: '#tour-modal-prod-toggles',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 9. Matriz de Variantes
  if (document.querySelector('#tour-modal-prod-variantes')) {
    tour.addStep({
      id: 'modal-prod-variantes-step',
      title: 'Variantes de Talla, Color y Stock',
      text: 'Agrega cada combinación disponible: elige la talla, selecciona el color visual con el selector HEX, escribe su nombre y define la cantidad exacta de existencias en bodega.',
      attachTo: {
        element: '#tour-modal-prod-variantes',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 10. Galería Fotográfica
  if (document.querySelector('#tour-modal-prod-imagenes')) {
    tour.addStep({
      id: 'modal-prod-imagenes-step',
      title: 'Fotos y Efecto Hover Swap',
      text: 'Sube las imágenes de tu producto. Marca la <strong>Foto Principal</strong>, la <strong>Vista Frontal</strong> y la <strong>Vista Reverso</strong> para que cambie de ángulo al pasar el mouse en la tienda virtual.',
      attachTo: {
        element: '#tour-modal-prod-imagenes',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 11. Botones de Acción
  if (document.querySelector('#tour-modal-prod-actions')) {
    tour.addStep({
      id: 'modal-prod-actions-step',
      title: 'Guardar Producto',
      text: 'Una vez completada la información, presiona <strong>"Guardar"</strong> para sincronizar los cambios de inmediato en la tienda virtual.',
      attachTo: {
        element: '#tour-modal-prod-actions',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Listo! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  }

  tour.start();
}

/**
 * 3. Tour Guiado del Modal de Categoría
 */
export function startCategoriaModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // 1. Cabecera
  tour.addStep({
    id: 'modal-cat-header',
    title: 'Crear / Editar Categoría',
    text: 'Acá puedes registrar una nueva categoría o modificar una existente para clasificar tus productos.',
    attachTo: {
      element: '#tour-modal-cat-header',
      on: 'bottom',
    },
    buttons: [
      {
        text: 'Omitir',
        classes: 'shepherd-button-secondary',
        action: () => tour.cancel(),
      },
      {
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // 2. Nombre
  if (document.querySelector('#tour-modal-cat-nombre')) {
    tour.addStep({
      id: 'modal-cat-nombre-step',
      title: 'Nombre de la Categoría',
      text: 'Ingresa el nombre con el que se mostrará en los filtros (ej. "Polerones Oversize", "Tazas Térmicas").',
      attachTo: {
        element: '#tour-modal-cat-nombre',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 3. Slug
  if (document.querySelector('#tour-modal-cat-slug')) {
    tour.addStep({
      id: 'modal-cat-slug-step',
      title: 'Identificador URL (Slug)',
      text: 'El texto amigable para la dirección web de esta categoría (ej. "polerones-oversize").',
      attachTo: {
        element: '#tour-modal-cat-slug',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 4. Línea Asignada
  if (document.querySelector('#tour-modal-cat-linea')) {
    tour.addStep({
      id: 'modal-cat-linea-step',
      title: 'Línea o Colección Asignada',
      text: 'Selecciona a qué línea pertenece esta categoría para que sus productos aparezcan vinculados de manera correcta.',
      attachTo: {
        element: '#tour-modal-cat-linea',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 5. Botones de Acción
  if (document.querySelector('#tour-modal-cat-actions')) {
    tour.addStep({
      id: 'modal-cat-actions-step',
      title: 'Guardar Cambios',
      text: 'Presiona <strong>"Guardar"</strong> para registrar la categoría en el sistema.',
      attachTo: {
        element: '#tour-modal-cat-actions',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Listo! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  }

  tour.start();
}

/**
 * 4. Tour Guiado del Modal de Línea / Colección
 */
export function startLineaModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // 1. Cabecera
  tour.addStep({
    id: 'modal-linea-header',
    title: 'Crear / Editar Línea',
    text: 'Las líneas permiten agrupar tus grandes colecciones de productos en la tienda virtual.',
    attachTo: {
      element: '#tour-modal-linea-header',
      on: 'bottom',
    },
    buttons: [
      {
        text: 'Omitir',
        classes: 'shepherd-button-secondary',
        action: () => tour.cancel(),
      },
      {
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // 2. Nombre
  if (document.querySelector('#tour-modal-linea-nombre')) {
    tour.addStep({
      id: 'modal-linea-nombre-step',
      title: 'Nombre de la Colección',
      text: 'Escribe el nombre distintivo de la línea (ej. "Urbana", "Deportiva", "Drinkware"). Al editarla, se sincronizará automáticamente en todos los productos asociados.',
      attachTo: {
        element: '#tour-modal-linea-nombre',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 3. Botones de Acción
  if (document.querySelector('#tour-modal-linea-actions')) {
    tour.addStep({
      id: 'modal-linea-actions-step',
      title: 'Guardar Línea',
      text: 'Presiona <strong>"Guardar Línea"</strong> para confirmar y aplicar los cambios en todo el sistema.',
      attachTo: {
        element: '#tour-modal-linea-actions',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Listo! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  }

  tour.start();
}

/**
 * 5. Tour Guiado del Modal de Trazabilidad e Historial de Pedido
 */
export function startOrderModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // 1. Cabecera del Pedido
  tour.addStep({
    id: 'modal-order-header',
    title: 'Expediente del Pedido',
    text: 'Acá encuentras el número de orden, la fecha de compra, el cliente y sus datos directos de contacto.',
    attachTo: {
      element: '#tour-modal-order-header',
      on: 'bottom',
    },
    buttons: [
      {
        text: 'Omitir',
        classes: 'shepherd-button-secondary',
        action: () => tour.cancel(),
      },
      {
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // 2. Conmutador entre Trazabilidad e Historial
  if (document.querySelector('#tour-modal-order-tab-switcher')) {
    tour.addStep({
      id: 'modal-order-tabs-step',
      title: 'Pestañas de Trazabilidad e Historial',
      text: 'Cambia entre la vista de <strong>Trazabilidad en vivo</strong> y la <strong>Bitácora de Notas</strong> para dejar apuntes internos del equipo.',
      attachTo: {
        element: '#tour-modal-order-tab-switcher',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 3. Línea de Tiempo
  if (document.querySelector('#tour-modal-order-timeline')) {
    tour.addStep({
      id: 'modal-order-timeline-step',
      title: 'Línea de Tiempo de Fabricación',
      text: 'Indica visualmente la etapa actual del pedido: <em>Pendiente</em> → <em>Pagado</em> → <em>En Taller / Producción</em> → <em>Despachado</em> → <em>Entregado</em>.',
      attachTo: {
        element: '#tour-modal-order-timeline',
        on: 'bottom',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 4. Cambiar Estado
  if (document.querySelector('#tour-modal-order-status-select')) {
    tour.addStep({
      id: 'modal-order-status-step',
      title: 'Actualizar Estado del Pedido',
      text: 'Cambia el estado con este selector. Al actualizarlo, el cliente podrá ver el avance en su portal de seguimiento con su código de orden.',
      attachTo: {
        element: '#tour-modal-order-status-select',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 5. Datos de Envío
  if (document.querySelector('#tour-modal-order-shipping')) {
    tour.addStep({
      id: 'modal-order-shipping-step',
      title: 'Dirección de Despacho',
      text: 'Dirección de entrega, comuna, región y teléfono directo para coordinar el despacho o entrega con el cliente.',
      attachTo: {
        element: '#tour-modal-order-shipping',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // 6. Desglose Financiero
  if (document.querySelector('#tour-modal-order-financial')) {
    tour.addStep({
      id: 'modal-order-finance-step',
      title: 'Desglose Financiero del Pedido',
      text: 'Visualiza el <strong>Total Bruto</strong> pagado por el cliente, la <strong>Comisión retenida</strong> por la pasarela de pagos y el <strong>Ingreso Neto Líquido</strong> que entra a tu cuenta.',
      attachTo: {
        element: '#tour-modal-order-financial',
        on: 'top',
      },
      buttons: [
        {
          text: '← Anterior',
          classes: 'shepherd-button-secondary',
          action: () => tour.back(),
        },
        {
          text: '¡Entendido! Finalizar ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  }

  tour.start();
}

