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
 * 1. Tour Integral del Panel según Pestaña Activa
 */
export function startPanelTabTour(tab: 'estadisticas' | 'ropa' | 'drinkware' | 'categorias' | 'lineas') {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  // Paso Inicial: Cabecera y Mando
  tour.addStep({
    id: 'tab-header',
    title: 'Centro de Mando Operativo',
    text: 'Plataforma administrativa integral de RC Estampa. Proporciona control de inventario, analítica financiera, trazabilidad logística y gobernanza del catálogo.',
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
        text: 'Siguiente →',
        classes: 'shepherd-button-primary',
        action: () => tour.next(),
      },
    ],
  });

  // Paso 2: Navegación de Módulos
  tour.addStep({
    id: 'tab-navigation',
    title: 'Arquitectura Modular',
    text: 'Conmutación fluida entre <strong>Estadísticas & Ventas</strong>, <strong>Ropa Textil</strong>, <strong>Colección Drinkware</strong>, <strong>Categorías</strong> y <strong>Líneas</strong>.',
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
    if (document.querySelector('#tour-stats-kpis')) {
      tour.addStep({
        id: 'stats-kpis-step',
        title: 'Métricas Financieras & Rentabilidad',
        text: 'Monitoreo en tiempo real del volumen bruto de facturación, ingresos netos liquidados (deduciendo tasas de MercadoPago), ticket promedio por transacción y alertas de inventario crítico.',
        attachTo: {
          element: '#tour-stats-kpis',
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

    if (document.querySelector('#tour-stats-orders')) {
      tour.addStep({
        id: 'stats-orders-step',
        title: 'Gobernanza de Órdenes & Trazabilidad',
        text: 'Auditoría cronológica de pedidos, verificación de pasarelas de pago, trazabilidad de producción en taller, gestión de comprobantes bancarios y bitácora interna.',
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
            text: 'Finalizar Guía ✓',
            classes: 'shepherd-button-primary',
            action: () => tour.complete(),
          },
        ],
      });
    }
  } else if (tab === 'ropa' || tab === 'drinkware') {
    const tipoLabel = tab === 'ropa' ? 'Prendas Textiles' : 'Artículos Drinkware';
    if (document.querySelector('#tour-btn-nuevo-producto')) {
      tour.addStep({
        id: 'cat-nuevo-step',
        title: `Ingreso de ${tipoLabel}`,
        text: `Alta de nuevos ítems con matriz de variantes (tallas, colores HEX, SKU individual y stock en bodega), especificaciones técnicas y galería fotográfica en alta fidelidad.`,
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

    if (document.querySelector('#tour-btn-export-excel')) {
      tour.addStep({
        id: 'cat-export-step',
        title: 'Reportes y Catálogo Corporativo en Excel',
        text: 'Generación instantánea de libros .xlsx estructurados con paleta oficial de marca, hojas organizadas por categoría y consolidación técnica para cotizaciones B2B.',
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

    if (document.querySelector('#tour-catalog-filters')) {
      tour.addStep({
        id: 'cat-filters-step',
        title: 'Segmentación y Filtros Facetados',
        text: 'Motor de búsqueda multi-palabra y filtrado reactivo por categoría, disponibilidad de existencias, estado público/oculto y sellos de lanzamiento o promoción.',
        attachTo: {
          element: '#tour-catalog-filters',
          on: 'bottom',
        },
        buttons: [
          {
            text: '← Anterior',
            classes: 'shepherd-button-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Finalizar Guía ✓',
            classes: 'shepherd-button-primary',
            action: () => tour.complete(),
          },
        ],
      });
    }
  } else if (tab === 'categorias') {
    tour.addStep({
      id: 'cat-mgmt-step',
      title: 'Taxonomía y Organización de Catálogo',
      text: 'Estructuración de categorías canónicas vinculadas a líneas operativas. Permite clasificar productos y alimentar los filtros dinámicos de la tienda virtual.',
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
          text: 'Finalizar Guía ✓',
          classes: 'shepherd-button-primary',
          action: () => tour.complete(),
        },
      ],
    });
  } else if (tab === 'lineas') {
    tour.addStep({
      id: 'lineas-mgmt-step',
      title: 'Gobernanza de Líneas & Colecciones',
      text: 'Control de colecciones maestras con protección de integridad relacional: regla de línea activa mínima y traspaso seguro de productos a la línea privada <em>"Ropa sin categoría"</em>.',
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
          text: 'Finalizar Guía ✓',
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

  tour.addStep({
    id: 'modal-prod-header',
    title: `Ficha Técnica de ${esRopa ? 'Prenda Textil' : 'Drinkware'}`,
    text: 'Formulario de alta fidelidad para parametrizar datos comerciales, matriz de variantes y recursos multimedia del producto.',
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

  tour.addStep({
    id: 'modal-prod-general',
    title: 'Datos Generales & Slug Canónico',
    text: 'Establece el nombre comercial y el identificador URL optimizado para SEO, junto a la descripción técnica de confección y técnicas de estampado.',
    attachTo: {
      element: '#tour-modal-prod-general',
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

  tour.addStep({
    id: 'modal-prod-taxonomy',
    title: 'Taxonomía, Precios y Atributos',
    text: `Asigna la categoría, línea de colección, precios regulares y de oferta${!esRopa ? ' y especificaciones de material y volumen' : ''}.`,
    attachTo: {
      element: '#tour-modal-prod-taxonomy',
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

  tour.addStep({
    id: 'modal-prod-variantes',
    title: 'Matriz de Variantes e Inventario',
    text: 'Define combinaciones de tallas, colores con selector HEX, código SKU único y existencias en bodega con validación automática.',
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

  tour.addStep({
    id: 'modal-prod-imagenes',
    title: 'Galería Fotográfica Oficial',
    text: 'Carga fotografías de estudio y asigna etiquetas de vista principal, frontal o posterior para la previsualización interactiva en tienda.',
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
        text: 'Finalizar Guía ✓',
        classes: 'shepherd-button-primary',
        action: () => tour.complete(),
      },
    ],
  });

  tour.start();
}

/**
 * 3. Tour Guiado del Modal de Categoría
 */
export function startCategoriaModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  tour.addStep({
    id: 'modal-cat-header',
    title: 'Gestión Taxonómica de Categoría',
    text: 'Crea o edita categorías asignadas a colecciones activas para organizar la navegación y los filtros de la tienda.',
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

  tour.addStep({
    id: 'modal-cat-form',
    title: 'Parámetros de la Categoría',
    text: 'Define el nombre oficial, el slug URL único para indexación y vincula la categoría a una línea de productos existente.',
    attachTo: {
      element: '#tour-modal-cat-form',
      on: 'top',
    },
    buttons: [
      {
        text: '← Anterior',
        classes: 'shepherd-button-secondary',
        action: () => tour.back(),
      },
      {
        text: 'Finalizar Guía ✓',
        classes: 'shepherd-button-primary',
        action: () => tour.complete(),
      },
    ],
  });

  tour.start();
}

/**
 * 4. Tour Guiado del Modal de Línea / Colección
 */
export function startLineaModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  tour.addStep({
    id: 'modal-linea-header',
    title: 'Gestión de Colecciones y Líneas',
    text: 'Administra las líneas estratégicas de producto. La edición se sincroniza automáticamente en toda la base de datos.',
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

  tour.addStep({
    id: 'modal-linea-form',
    title: 'Identificación de la Línea',
    text: 'Ingresa el nombre distintivo de la colección que se utilizará en los badges, reportes y navegación pública.',
    attachTo: {
      element: '#tour-modal-linea-form',
      on: 'top',
    },
    buttons: [
      {
        text: '← Anterior',
        classes: 'shepherd-button-secondary',
        action: () => tour.back(),
      },
      {
        text: 'Finalizar Guía ✓',
        classes: 'shepherd-button-primary',
        action: () => tour.complete(),
      },
    ],
  });

  tour.start();
}

/**
 * 5. Tour Guiado del Modal de Trazabilidad e Historial de Pedido
 */
export function startOrderModalTour() {
  const tour = new Shepherd.Tour(DEFAULT_OPTIONS);

  tour.addStep({
    id: 'modal-order-header',
    title: 'Trazabilidad y Control del Pedido',
    text: 'Expediente integral del pedido con auditoría de estados, liquidación financiera de pasarela y datos logísticos de entrega.',
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

  tour.addStep({
    id: 'modal-order-body',
    title: 'Ciclo de Fabricación & Despacho',
    text: 'Permite actualizar el estado operativo (Pendiente, Pagado, En Proceso, Enviado, Entregado), añadir notas de bitácora y coordinar la entrega con el cliente.',
    attachTo: {
      element: '#tour-modal-order-body',
      on: 'top',
    },
    buttons: [
      {
        text: '← Anterior',
        classes: 'shepherd-button-secondary',
        action: () => tour.back(),
      },
      {
        text: 'Finalizar Guía ✓',
        classes: 'shepherd-button-primary',
        action: () => tour.complete(),
      },
    ],
  });

  tour.start();
}
