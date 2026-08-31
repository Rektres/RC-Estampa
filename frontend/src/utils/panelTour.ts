import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function startPanelTour(force = false) {
  const TOUR_STORAGE_KEY = 'rc_panel_tour_completed';
  if (!force && localStorage.getItem(TOUR_STORAGE_KEY) === 'true') {
    return;
  }

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
      scrollTo: { behavior: 'smooth', block: 'center' },
      classes: 'shepherd-luxury-tour',
    },
  });

  // Paso 1: Bienvenida al Panel
  tour.addStep({
    id: 'panel-header',
    title: '¡Bienvenido al Panel de Administración!',
    text: 'Desde este centro de control puedes gestionar todo el inventario, catálogo de ropa y drinkware, estadísticas de ventas, órdenes de compra y colecciones de RC Estampa.',
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

  // Paso 2: Pestañas de Navegación
  tour.addStep({
    id: 'panel-tabs',
    title: 'Módulos y Pestañas de Gestión',
    text: 'Navega fácilmente entre <strong>Estadísticas & Ventas</strong>, <strong>Ropa Textil</strong>, <strong>Colección Drinkware</strong>, <strong>Categorías</strong> y <strong>Líneas / Colecciones</strong> dinámicas.',
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

  // Paso 3: Botón de Tour Guiado
  tour.addStep({
    id: 'btn-tour',
    title: 'Asistencia y Guía Interactiva',
    text: '¿Necesitas repasar cómo funciona alguna sección? Puedes reiniciar este tour guiado en cualquier momento haciendo clic en este botón.',
    attachTo: {
      element: '#tour-btn-guiado',
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

  // Paso 4: Métricas Financieras (si están presentes)
  if (document.querySelector('#tour-stats-kpis')) {
    tour.addStep({
      id: 'stats-kpis',
      title: 'Métricas Financieras en Tiempo Real',
      text: 'Visualiza tus ingresos brutos, ingresos líquidos (descontando comisiones de MercadoPago), ticket promedio y alertas automáticas de inventario con stock crítico.',
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

  // Paso 5: Gestión de Órdenes y Trazabilidad (si está presente)
  if (document.querySelector('#tour-stats-orders')) {
    tour.addStep({
      id: 'stats-orders',
      title: 'Trazabilidad y Estado de Pedidos',
      text: 'Supervisa el historial de transacciones, métodos de pago, comprobantes de transferencia y actualiza el estado de cada pedido con auditoría y notas internas.',
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
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // Paso 6: Crear Producto (si está en Ropa o Drinkware)
  if (document.querySelector('#tour-btn-nuevo-producto')) {
    tour.addStep({
      id: 'btn-nuevo-producto',
      title: 'Creación de Nuevos Productos',
      text: 'Añade productos con control granular de variantes (tallas, colores, stock por SKU), galería de fotos, asignación de línea/categoría y precios de oferta.',
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

  // Paso 7: Exportar Catálogo a Excel (si está presente)
  if (document.querySelector('#tour-btn-export-excel')) {
    tour.addStep({
      id: 'btn-export-excel',
      title: 'Reportes y Catálogo en Excel',
      text: 'Exporta todo el inventario en formato .xlsx con diseño corporativo, hojas separadas por categoría y totales consolidados listos para cotizaciones.',
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

  // Paso 8: Filtros y Búsqueda (si está presente)
  if (document.querySelector('#tour-catalog-filters')) {
    tour.addStep({
      id: 'catalog-filters',
      title: 'Filtros y Búsqueda Rápida',
      text: 'Filtra productos por categoría, estado activo/inactivo, disponibilidad de stock o etiquetas destacadas, con búsqueda multi-palabra en vivo.',
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
          text: 'Siguiente →',
          classes: 'shepherd-button-primary',
          action: () => tour.next(),
        },
      ],
    });
  }

  // Paso Final
  tour.addStep({
    id: 'tour-finish',
    title: '¡Todo listo para gestionar!',
    text: 'Has completado el recorrido guiado. Si tienes consultas adicionales o necesitas soporte, todos los módulos están optimizados para una administración rápida y segura.',
    buttons: [
      {
        text: 'Finalizar Tour ✓',
        classes: 'shepherd-button-primary',
        action: () => {
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          tour.complete();
        },
      },
    ],
  });

  tour.on('cancel', () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  });

  tour.start();
}
