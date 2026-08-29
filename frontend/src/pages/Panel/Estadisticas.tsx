import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  MapPin,
  PackageCheck,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  Search,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  History,
  Phone,
  Mail,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import { panelApi, pedidosApi, type EstadisticasData } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import PedidoTimeline from '../../components/shared/PedidoTimeline';

const PERIODOS = [
  { key: 'todo', label: 'Todo el tiempo' },
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
  { key: 'este_mes', label: 'Este mes' },
  { key: 'este_ano', label: 'Este año' },
];

const ESTADOS_DISPONIBLES = [
  { key: 'pagado', label: 'Pagado', color: 'success', border: '#22c55e' },
  { key: 'en_proceso', label: 'En Proceso', color: 'warning', border: '#eab308' },
  { key: 'enviado', label: 'Enviado', color: 'info', border: '#06b6d4' },
  { key: 'entregado', label: 'Entregado', color: 'primary', border: '#c9a84c' },
  { key: 'pendiente', label: 'Pendiente', color: 'secondary', border: '#64748b' },
  { key: 'cancelado', label: 'Cancelado', color: 'danger', border: '#ef4444' },
];

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('todo');
  const [reload, setReload] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  
  // Multi-filtro por estado
  const [estadosFiltro, setEstadosFiltro] = useState<string[]>([]);
  
  // Paginación y Modos de Carga
  const [modoCarga, setModoCarga] = useState<'paginacion' | 'lazy'>('paginacion');
  const [filasPorPagina, setFilasPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [lazyLimit, setLazyLimit] = useState<number>(15);

  // Ordenamiento de Columnas
  const [sortColumn, setSortColumn] = useState<string>('creado_en');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isExporting, setIsExporting] = useState(false);
  const [updatingNumero, setUpdatingNumero] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [historyTx, setHistoryTx] = useState<any | null>(null);
  const [notaCambio, setNotaCambio] = useState('');
  const [modalNuevoEstado, setModalNuevoEstado] = useState('');

  // Estados para Top Productos
  const [topProdsLimit, setTopProdsLimit] = useState(5);
  const [topProdsSearch, setTopProdsSearch] = useState('');

  const { data, loading, error } = useAsync<EstadisticasData>(
    () => panelApi.estadisticas(periodo),
    [periodo, reload]
  );

  const kpis = data?.kpis;

  // Bloquear scroll de fondo cuando un modal esté abierto (sin mover la posición del usuario)
  useEffect(() => {
    if (selectedTx || historyTx) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTx, historyTx]);

  // Toggle de multi-filtro por estado
  const toggleEstadoFiltro = (estadoKey: string) => {
    setEstadosFiltro((prev) => {
      if (prev.includes(estadoKey)) {
        return prev.filter((k) => k !== estadoKey);
      } else {
        return [...prev, estadoKey];
      }
    });
    setPaginaActual(1);
  };

  const seleccionarTodosLosEstados = () => {
    setEstadosFiltro(ESTADOS_DISPONIBLES.map((e) => e.key));
    setPaginaActual(1);
  };

  const limpiarFiltrosDeEstado = () => {
    setEstadosFiltro([]);
    setPaginaActual(1);
  };

  // Toggle ordenamiento de columnas
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
    setPaginaActual(1);
  };

  // Filtrado y ordenamiento de Top Productos (Mayor a Menor por Monto y Unidades)
  const topProductosFiltrados = useMemo(() => {
    if (!data?.top_productos) return [];
    const list = [...data.top_productos].sort(
      (a, b) => b.ingresos_totales - a.ingresos_totales || b.unidades_vendidas - a.unidades_vendidas
    );
    if (!topProdsSearch.trim()) return list;
    const q = topProdsSearch.toLowerCase().trim();
    return list.filter(
      (p) => p.nombre.toLowerCase().includes(q) || (p.tipo && p.tipo.toLowerCase().includes(q))
    );
  }, [data?.top_productos, topProdsSearch]);

  const topProductosVisibles = useMemo(() => {
    return topProductosFiltrados.slice(0, topProdsLimit);
  }, [topProductosFiltrados, topProdsLimit]);

  // Filtro de fechas en tabla de pedidos
  const [filtroFecha, setFiltroFecha] = useState<'todos' | 'hoy' | '7d' | '30d' | 'este_mes' | 'personalizado'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Filtrado y ordenamiento reactivo de todos los pedidos
  const transaccionesFiltradas = useMemo(() => {
    if (!data?.ultimas_transacciones) return [];
    const ahora = new Date();
    
    // 1. Filtrar por estados múltiples, texto de búsqueda y fechas
    const filtered = data.ultimas_transacciones.filter((tx) => {
      const matchEstado = estadosFiltro.length === 0 || estadosFiltro.includes(tx.estado);
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        tx.numero.toLowerCase().includes(q) ||
        tx.nombre.toLowerCase().includes(q) ||
        tx.email.toLowerCase().includes(q) ||
        (tx.telefono && tx.telefono.toLowerCase().includes(q)) ||
        (tx.payment_method_id && tx.payment_method_id.toLowerCase().includes(q)) ||
        (tx.card_last_four && tx.card_last_four.includes(q));

      // Filtro de fecha
      let matchFecha = true;
      if (filtroFecha !== 'todos' && tx.creado_en) {
        const f = new Date(tx.creado_en);
        if (filtroFecha === 'hoy') {
          matchFecha = f.toDateString() === ahora.toDateString();
        } else if (filtroFecha === '7d') {
          const l7 = new Date();
          l7.setDate(ahora.getDate() - 7);
          matchFecha = f >= l7;
        } else if (filtroFecha === '30d') {
          const l30 = new Date();
          l30.setDate(ahora.getDate() - 30);
          matchFecha = f >= l30;
        } else if (filtroFecha === 'este_mes') {
          matchFecha = f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth();
        } else if (filtroFecha === 'personalizado') {
          if (fechaDesde) matchFecha = matchFecha && f >= new Date(fechaDesde + 'T00:00:00');
          if (fechaHasta) matchFecha = matchFecha && f <= new Date(fechaHasta + 'T23:59:59');
        }
      }

      return matchEstado && matchBusqueda && matchFecha;
    });

    // 2. Ordenar según la columna seleccionada
    return filtered.sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === 'neto') {
        valA = a.monto_neto ?? (a.total - (a.comision_mp || 0));
        valB = b.monto_neto ?? (b.total - (b.comision_mp || 0));
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data?.ultimas_transacciones, estadosFiltro, busqueda, filtroFecha, fechaDesde, fechaHasta, sortColumn, sortDirection]);

  // Paginación o Lazy Load
  const totalPaginas = Math.ceil(transaccionesFiltradas.length / (filasPorPagina || 10)) || 1;
  const transaccionesPaginadas = useMemo(() => {
    if (modoCarga === 'lazy') {
      return transaccionesFiltradas.slice(0, lazyLimit);
    }
    const inicio = (paginaActual - 1) * filasPorPagina;
    return transaccionesFiltradas.slice(inicio, inicio + filasPorPagina);
  }, [transaccionesFiltradas, modoCarga, paginaActual, filasPorPagina, lazyLimit]);

  async function handleExportExcel() {
    setIsExporting(true);
    try {
      await panelApi.exportarExcel(periodo);
    } catch (err) {
      alert('Error al generar el archivo Excel. Revisa tu conexión o permisos.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCambiarEstado(numero: string, nuevoEstado: string, nota: string = '') {
    setUpdatingNumero(numero);
    try {
      await pedidosApi.cambiarEstado(numero, nuevoEstado, nota);
      setReload((n) => n + 1);
      
      const nuevoEvento = {
        estado_anterior: selectedTx?.estado || historyTx?.estado || 'pendiente',
        estado_nuevo: nuevoEstado,
        fecha: new Date().toISOString(),
        autor: 'Administrador',
        nota: nota,
      };

      if (selectedTx && selectedTx.numero === numero) {
        setSelectedTx({
          ...selectedTx,
          estado: nuevoEstado,
          historial_estados: [...(selectedTx.historial_estados || []), nuevoEvento],
        });
      }
      if (historyTx && historyTx.numero === numero) {
        setHistoryTx({
          ...historyTx,
          estado: nuevoEstado,
          historial_estados: [...(historyTx.historial_estados || []), nuevoEvento],
        });
        setNotaCambio('');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingNumero(null);
    }
  }

  // Helper para renderizar badges de estado de alto contraste en Dark & Light
  const renderEstadoBadge = (estadoKey: string) => {
    const est = ESTADOS_DISPONIBLES.find((e) => e.key === estadoKey);
    const label = est ? est.label : estadoKey;
    const cleanKey = (estadoKey || 'pendiente').toLowerCase().replace('_', '-');
    return (
      <span
        className={`badge badge-status-${cleanKey} text-uppercase px-2 py-1`}
        style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
      >
        {label}
      </span>
    );
  };

  // Helper para íconos de ordenamiento en columnas
  const renderSortIndicator = (col: string) => {
    if (sortColumn !== col) {
      return <ArrowUpDown size={12} className="text-muted opacity-50 ms-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-primary ms-1" />
    ) : (
      <ArrowDown size={12} className="text-primary ms-1" />
    );
  };

  return (
    <div className="d-flex flex-column gap-4 animate-tab-fade">
      {/* Header & Filtro de Período & Botón Excel */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4 bg-surface border border-border">
        <div>
          <div className="d-flex align-items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="fs-5 fw-bold font-montserrat text-text mb-0">Métricas & Gestión Integral de Ventas</h2>
          </div>
          <p className="small text-muted mb-0 mt-1 font-montserrat">
            Auditoría en tiempo real de ingresos brutos, netos, comisiones y trazabilidad operativa de pedidos.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Selector de Período */}
          <div className="btn-group bg-elevated rounded-3 p-1 border border-border">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPeriodo(p.key); setPaginaActual(1); }}
                className={`btn btn-sm border-0 font-montserrat ${
                  periodo === p.key
                    ? 'btn-primary text-black fw-bold shadow-sm'
                    : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Botón Exportar Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting || loading}
            className="btn btn-sm btn-outline-success font-montserrat fw-semibold d-flex align-items-center gap-1 px-3 py-2"
            style={{ borderRadius: '8px' }}
            title="Exportar informe multi-hoja a Excel"
          >
            <FileSpreadsheet size={15} />
            <span>{isExporting ? 'Generando...' : 'Exportar Excel (.xlsx)'}</span>
          </button>

          {/* Botón Actualizar */}
          <button
            onClick={() => setReload((n) => n + 1)}
            disabled={loading}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-2"
            style={{ borderRadius: '8px' }}
            title="Actualizar datos en vivo"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span className="d-none d-sm-inline font-montserrat">Actualizar</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-center py-5 text-muted font-montserrat">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          Cargando estadísticas de ventas...
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger py-2 mb-0 font-montserrat small" role="alert">
          {error instanceof Error ? error.message : 'No se pudieron cargar las estadísticas.'}
        </div>
      ) : null}

      {data && kpis && (
        <>
          {/* Fila 1: KPIs Principales */}
          <div className="row g-3">
            {/* Total Ventas Bruto */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100 position-relative overflow-hidden hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="font-montserrat small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    Ventas Totales Brutas
                  </span>
                  <div className="p-2 rounded-3 bg-primary-10 text-primary">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="font-montserrat fs-4 fw-bold text-text mb-1">
                  {formatPrice(kpis.total_ventas_bruto)}
                </div>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
                  {kpis.total_pedidos_pagados} pedidos aprobados
                </span>
              </div>
            </div>

            {/* Ingreso Neto Líquido */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100 position-relative overflow-hidden hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="font-montserrat small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    Ingreso Neto Líquido
                  </span>
                  <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="font-montserrat fs-4 fw-bold text-success mb-1">
                  {formatPrice(kpis.total_ventas_neto)}
                </div>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
                  Post comisiones de pasarela
                </span>
              </div>
            </div>

            {/* Comisiones Mercado Pago */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100 position-relative overflow-hidden hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="font-montserrat small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    Comisiones Retenidas (MP)
                  </span>
                  <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                    <CreditCard size={16} />
                  </div>
                </div>
                <div className="font-montserrat fs-4 fw-bold text-warning mb-1">
                  {formatPrice(kpis.total_comision_mp)}
                </div>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
                  Fee pasarela + IVA incluido
                </span>
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100 position-relative overflow-hidden hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="font-montserrat small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    Ticket Promedio & Conv.
                  </span>
                  <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="font-montserrat fs-4 fw-bold text-text mb-1">
                  {formatPrice(kpis.ticket_promedio)}
                </div>
                <span className="font-montserrat text-primary fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Conversión: {kpis.tasa_conversion}% ({kpis.total_pedidos_generados} totales)
                </span>
              </div>
            </div>
          </div>

          {/* Fila 2: Embudo Dinámico con Multi-Filtro por Estado */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <PackageCheck size={18} className="text-primary" />
                <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">
                  Embudo de Gestión de Pedidos por Estado (Filtro Múltiple)
                </h3>
              </div>
              <div className="d-flex align-items-center gap-2">
                {estadosFiltro.length > 0 ? (
                  <>
                    <button
                      onClick={limpiarFiltrosDeEstado}
                      className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 font-montserrat fw-semibold"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <X size={13} />
                      <span>Limpiar filtros ({estadosFiltro.length} activos)</span>
                    </button>
                    <button
                      onClick={seleccionarTodosLosEstados}
                      className="btn btn-sm btn-outline-secondary font-montserrat"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Seleccionar Todos
                    </button>
                  </>
                ) : (
                  <span className="font-montserrat small text-muted" style={{ fontSize: '0.75rem' }}>
                    💡 Puedes seleccionar más de un estado simultáneamente
                  </span>
                )}
              </div>
            </div>

            <div className="row g-2">
              {ESTADOS_DISPONIBLES.map((est) => {
                const count = kpis.conteo_estados[est.key] || 0;
                const isSelected = estadosFiltro.includes(est.key);
                return (
                  <div key={est.key} className="col-6 col-sm-4 col-md-2">
                    <div
                      onClick={() => toggleEstadoFiltro(est.key)}
                      className={`p-3 rounded-3 text-center border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-elevated border-primary shadow-sm'
                          : 'bg-elevated border-border hover-lift'
                      }`}
                      style={{
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.03)' : 'none',
                        borderWidth: isSelected ? '2px' : '1px',
                        borderColor: isSelected ? 'var(--brand-primary)' : undefined,
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        {isSelected ? (
                          <CheckSquare size={13} className="text-primary" />
                        ) : (
                          <Square size={13} className="text-muted" />
                        )}
                        <span className="small text-muted font-montserrat fw-semibold">{est.label}</span>
                      </div>
                      <span className="fs-5 fw-bold font-montserrat" style={{ color: est.border }}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fila 3: Top Productos (Orden por Monto & Unidades) & Ventas por Línea */}
          <div className="row g-3">
            {/* Top Productos Ranking */}
            <div className="col-12 col-lg-7">
              <div className="p-4 rounded-4 bg-surface border border-border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Sparkles size={18} className="text-primary" />
                      <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Top Productos Más Vendidos</h3>
                    </div>
                    <span className="badge bg-elevated text-text border border-border font-montserrat" style={{ fontSize: '0.72rem' }}>
                      Por Monto Total ($) & Unidades
                    </span>
                  </div>

                  {/* Input Búsqueda en Top Productos */}
                  <div className="position-relative mb-3">
                    <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      value={topProdsSearch}
                      onChange={(e) => setTopProdsSearch(e.target.value)}
                      placeholder="Filtrar producto por nombre o tipo..."
                      className="form-control form-control-sm bg-elevated text-text border-border ps-5 font-montserrat"
                      style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                    {topProdsSearch && (
                      <button
                        onClick={() => setTopProdsSearch('')}
                        className="btn btn-sm p-0 position-absolute text-muted border-0 bg-transparent"
                        style={{ right: '8px', top: '6px' }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {topProductosVisibles.length === 0 ? (
                    <div className="text-center py-4 text-muted small font-montserrat">
                      No hay productos que coincidan con la búsqueda.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {topProductosVisibles.map((prod, idx) => {
                        const maxRevenue = topProductosFiltrados[0]?.ingresos_totales || 1;
                        const pct = Math.round((prod.ingresos_totales / maxRevenue) * 100);
                        return (
                          <div key={idx} className="p-2 rounded-3 bg-elevated border border-border hover-lift">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary text-black fw-bold" style={{ fontSize: '0.7rem' }}>
                                  #{idx + 1}
                                </span>
                                <span className="font-montserrat fw-semibold text-text small">{prod.nombre}</span>
                                <span className="badge bg-surface text-muted border border-border text-uppercase" style={{ fontSize: '0.65rem' }}>
                                  {prod.tipo}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="font-montserrat fw-bold text-primary small me-2">{formatPrice(prod.ingresos_totales)}</span>
                                <span className="font-montserrat text-muted small">({prod.unidades_vendidas} un.)</span>
                              </div>
                            </div>
                            <div className="progress bg-surface border border-border" style={{ height: '6px' }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${pct}%` }}
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botón Cargar Más */}
                {topProductosFiltrados.length > topProdsLimit && (
                  <div className="text-center mt-3 pt-2 border-top border-border">
                    <button
                      onClick={() => setTopProdsLimit((prev) => prev + 5)}
                      className="btn btn-sm btn-outline-secondary font-montserrat d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <Plus size={13} />
                      <span>Cargar más productos ({topProductosFiltrados.length - topProdsLimit} restantes)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ventas por Línea & Canales */}
            <div className="col-12 col-lg-5">
              <div className="p-4 rounded-4 bg-surface border border-border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Layers size={18} className="text-primary" />
                    <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Ventas por Línea de Producto</h3>
                  </div>

                  {data.ventas_por_linea.length === 0 ? (
                    <div className="text-center py-4 text-muted small font-montserrat">Sin ventas registradas.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2 mb-4">
                      {data.ventas_por_linea.map((l, idx) => (
                        <div key={idx} className="p-3 rounded-3 bg-elevated border border-border d-flex align-items-center justify-content-between hover-lift">
                          <div>
                            <span className="font-montserrat fw-bold text-text small d-block">{l.linea}</span>
                            <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>{l.unidades} unidades vendidas</span>
                          </div>
                          <span className="font-montserrat fw-bold text-primary">{formatPrice(l.ingresos)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medios de Pago */}
                <div className="pt-3 border-top border-border">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <CreditCard size={15} className="text-primary" />
                    <span className="font-montserrat fw-bold text-text small">Distribución por Medios de Pago</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {data.medios_pago.map((mp, idx) => (
                      <div key={idx} className="p-2 rounded-2 bg-elevated border border-border font-montserrat small">
                        <span className="text-uppercase fw-semibold text-text me-1">{mp.metodo}:</span>
                        <span className="text-primary fw-bold">{formatPrice(mp.total)}</span>
                        <span className="text-muted ms-1">({mp.conteo})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 4: Búsqueda, Ordenamiento, Paginación y Gestión de Pedidos */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            {/* Barra de Controles Superiores */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Clock size={18} className="text-primary" />
                <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Gestión de Pedidos & Trazabilidad</h3>
                <span className="badge bg-elevated text-primary border border-border font-montserrat fw-bold">
                  {transaccionesFiltradas.length} órdenes encontradas
                </span>
                {estadosFiltro.length > 0 && (
                  <span className="badge bg-primary text-black font-montserrat fw-bold">
                    Filtros: {estadosFiltro.join(', ').toUpperCase()}
                  </span>
                )}
              </div>

              {/* Controles de Búsqueda y Modo de Carga */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Selector de Modo: Paginación vs Lazy Load */}
                <div className="btn-group btn-group-sm bg-elevated rounded-3 p-1 border border-border">
                  <button
                    onClick={() => setModoCarga('paginacion')}
                    className={`btn btn-sm border-0 font-montserrat ${
                      modoCarga === 'paginacion' ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Paginado
                  </button>
                  <button
                    onClick={() => setModoCarga('lazy')}
                    className={`btn btn-sm border-0 font-montserrat ${
                      modoCarga === 'lazy' ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Lazy Load
                  </button>
                </div>

                {/* Filas por Página (Modo Paginación) */}
                {modoCarga === 'paginacion' && (
                  <select
                    value={filasPorPagina}
                    onChange={(e) => { setFilasPorPagina(Number(e.target.value)); setPaginaActual(1); }}
                    className="form-select form-select-sm bg-elevated text-text border-border font-montserrat w-auto"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <option value={5}>5 filas</option>
                    <option value={10}>10 filas</option>
                    <option value={25}>25 filas</option>
                    <option value={50}>50 filas</option>
                    <option value={100}>100 filas</option>
                  </select>
                )}

                {/* Input Buscador */}
                <div className="position-relative" style={{ minWidth: '240px', maxWidth: '340px' }}>
                  <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '9px' }} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                    placeholder="Buscar pedido, cliente, fono..."
                    className="form-control form-control-sm bg-elevated text-text border-border ps-5 font-montserrat"
                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="btn btn-sm p-0 position-absolute text-muted border-0 bg-transparent"
                      style={{ right: '8px', top: '6px' }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fila de Filtros de Fecha para la Tabla */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 p-2 bg-elevated rounded-3 border border-border font-montserrat">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <span className="small text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>Filtrar por Fecha:</span>
                <div className="btn-group btn-group-sm bg-surface rounded-2 p-0 border border-border">
                  {[
                    { key: 'todos', label: 'Todo' },
                    { key: 'hoy', label: 'Hoy' },
                    { key: '7d', label: '7 días' },
                    { key: '30d', label: '30 días' },
                    { key: 'este_mes', label: 'Este mes' },
                    { key: 'personalizado', label: 'Rango' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => { setFiltroFecha(f.key as any); setPaginaActual(1); }}
                      className={`btn btn-sm border-0 ${
                        filtroFecha === f.key ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                      }`}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filtroFecha === 'personalizado' && (
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => { setFechaDesde(e.target.value); setPaginaActual(1); }}
                    className="form-control form-control-sm bg-surface text-text border-border"
                    style={{ fontSize: '0.72rem', width: '125px' }}
                    title="Fecha Desde"
                  />
                  <span className="text-muted small">a</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => { setFechaHasta(e.target.value); setPaginaActual(1); }}
                    className="form-control form-control-sm bg-surface text-text border-border"
                    style={{ fontSize: '0.72rem', width: '125px' }}
                    title="Fecha Hasta"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                      className="btn btn-sm btn-outline-secondary p-1"
                      title="Limpiar fechas"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {transaccionesFiltradas.length === 0 ? (
              <div className="text-center py-5 text-muted small font-montserrat">
                No se encontraron pedidos con los filtros aplicados ({estadosFiltro.length > 0 ? `Estados: ${estadosFiltro.join(', ')}` : 'General'}).
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card-border-gold)' }}>
                      {/* Fecha & N° Pedido Sortable */}
                      <th
                        onClick={() => handleSort('creado_en')}
                        className="font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Fecha de Creación"
                      >
                        <div className="d-flex align-items-center">
                          <span>Fecha & Hora</span>
                          {renderSortIndicator('creado_en')}
                        </div>
                      </th>

                      {/* N° Pedido Sortable */}
                      <th
                        onClick={() => handleSort('numero')}
                        className="font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por N° Pedido"
                      >
                        <div className="d-flex align-items-center">
                          <span>N° Pedido</span>
                          {renderSortIndicator('numero')}
                        </div>
                      </th>

                      {/* Cliente Sortable */}
                      <th
                        onClick={() => handleSort('nombre')}
                        className="font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Nombre de Cliente"
                      >
                        <div className="d-flex align-items-center">
                          <span>Cliente & Contacto</span>
                          {renderSortIndicator('nombre')}
                        </div>
                      </th>

                      {/* Medio Sortable */}
                      <th
                        onClick={() => handleSort('payment_method_id')}
                        className="font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Medio de Pago"
                      >
                        <div className="d-flex align-items-center">
                          <span>Medio / Tarjeta</span>
                          {renderSortIndicator('payment_method_id')}
                        </div>
                      </th>

                      {/* Bruto Sortable */}
                      <th
                        onClick={() => handleSort('total')}
                        className="text-end font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Total Bruto"
                      >
                        <div className="d-flex align-items-center justify-content-end">
                          <span>Bruto</span>
                          {renderSortIndicator('total')}
                        </div>
                      </th>

                      {/* Comisión Sortable */}
                      <th
                        onClick={() => handleSort('comision_mp')}
                        className="text-end font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Comisión MP"
                      >
                        <div className="d-flex align-items-center justify-content-end">
                          <span>Comisión</span>
                          {renderSortIndicator('comision_mp')}
                        </div>
                      </th>

                      {/* Neto Sortable */}
                      <th
                        onClick={() => handleSort('neto')}
                        className="text-end font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Ingreso Neto"
                      >
                        <div className="d-flex align-items-center justify-content-end">
                          <span>Neto</span>
                          {renderSortIndicator('neto')}
                        </div>
                      </th>

                      {/* Estado Sortable */}
                      <th
                        onClick={() => handleSort('estado')}
                        className="text-center font-montserrat fw-bold text-text small py-3 cursor-pointer user-select-none"
                        style={{ cursor: 'pointer', letterSpacing: '0.04em' }}
                        title="Ordenar por Estado"
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <span>Estado</span>
                          {renderSortIndicator('estado')}
                        </div>
                      </th>

                      <th className="text-center font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesPaginadas.map((tx) => (
                      <tr key={tx.numero} className="border-bottom border-border">
                        <td className="font-montserrat text-muted small text-nowrap" style={{ fontSize: '0.75rem' }}>
                          <div>{new Date(tx.creado_en).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="text-muted opacity-75" style={{ fontSize: '0.7rem' }}>
                            {new Date(tx.creado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="font-montserrat fw-bold text-primary small">
                          {tx.numero}
                        </td>
                        <td>
                          <div className="font-montserrat fw-semibold text-text small">{tx.nombre}</div>
                          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                            <Mail size={12} className="text-primary flex-shrink-0" />
                            <span>{tx.email}</span>
                          </div>
                          {tx.telefono && (
                            <div className="text-primary fw-semibold d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.72rem' }}>
                              <Phone size={11} />
                              <span>{tx.telefono}</span>
                            </div>
                          )}
                          {tx.comuna && (
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>📍 {tx.comuna}, {tx.region}</div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1 small text-text">
                            <span className="text-uppercase fw-semibold">{tx.payment_method_id || tx.metodo_pago}</span>
                            {tx.card_last_four && (
                              <span className="text-muted">•••• {tx.card_last_four}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-end font-montserrat fw-bold text-text small">
                          {formatPrice(tx.total)}
                        </td>
                        <td className="text-end font-montserrat text-warning small">
                          -{formatPrice(tx.comision_mp || 0)}
                        </td>
                        <td className="text-end font-montserrat fw-bold text-success small">
                          {formatPrice(tx.monto_neto ?? (tx.total - (tx.comision_mp || 0)))}
                        </td>

                        {/* Modificador de Estado en Vivo para Admin */}
                        <td className="text-center">
                          <select
                            value={tx.estado}
                            disabled={updatingNumero === tx.numero}
                            onChange={(e) => handleCambiarEstado(tx.numero, e.target.value)}
                            className="form-select form-select-sm bg-elevated text-text border-border font-montserrat fw-semibold d-inline-block w-auto"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 1.8rem 0.25rem 0.6rem' }}
                          >
                            {ESTADOS_DISPONIBLES.map((est) => (
                              <option key={est.key} value={est.key}>
                                {est.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="text-center">
                          <div className="d-inline-flex gap-1">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2 font-montserrat"
                              style={{ fontSize: '0.75rem' }}
                              title="Ver trazabilidad visual"
                            >
                              <Eye size={13} />
                              <span className="d-none d-md-inline">Trazabilidad</span>
                            </button>
                            <button
                              onClick={() => {
                                const freshTx = data?.ultimas_transacciones?.find((t) => t.numero === tx.numero) || tx;
                                setHistoryTx(freshTx);
                                setModalNuevoEstado(freshTx.estado);
                              }}
                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 py-1 px-2 font-montserrat"
                              style={{ fontSize: '0.75rem' }}
                              title="Ver historial de cambios de estado y notas"
                            >
                              <History size={13} />
                              <span className="d-none d-md-inline">Historial</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Controles Inferiores de Paginación / Lazy Load */}
            {transaccionesFiltradas.length > 0 && (
              <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 pt-3 mt-3 border-top border-border font-montserrat small">
                {modoCarga === 'paginacion' ? (
                  <>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Mostrando {((paginaActual - 1) * filasPorPagina) + 1} — {Math.min(paginaActual * filasPorPagina, transaccionesFiltradas.length)} de {transaccionesFiltradas.length} órdenes
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                        disabled={paginaActual <= 1}
                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                        title="Página Anterior"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="px-2 text-text fw-semibold" style={{ fontSize: '0.8rem' }}>
                        Página {paginaActual} de {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaActual >= totalPaginas}
                        className="btn btn-sm btn-outline-secondary px-2 py-1"
                        title="Página Siguiente"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Mostrando {Math.min(lazyLimit, transaccionesFiltradas.length)} de {transaccionesFiltradas.length} órdenes cargadas
                    </span>
                    {lazyLimit < transaccionesFiltradas.length && (
                      <button
                        onClick={() => setLazyLimit((prev) => prev + 15)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 font-montserrat"
                      >
                        <Plus size={13} />
                        <span>Cargar más pedidos ({transaccionesFiltradas.length - lazyLimit} restantes)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal 1: Trazabilidad y Detalle de Pedido */}
      {selectedTx && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060, backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-surface border border-border rounded-4 p-4 shadow-lg w-100 animate-tab-fade"
            style={{ maxWidth: '44rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between border-bottom border-border pb-3 mb-3">
              <div>
                <h4 className="font-montserrat fw-bold text-text fs-5 mb-0">
                  Trazabilidad del Pedido: <span className="text-primary">{selectedTx.numero}</span>
                </h4>
                <div className="font-montserrat text-muted small mt-1 d-flex flex-wrap align-items-center gap-3">
                  <span><strong>Cliente:</strong> {selectedTx.nombre}</span>
                  <span><Mail size={12} className="text-primary me-1" />{selectedTx.email}</span>
                  {selectedTx.telefono && (
                    <span className="text-primary fw-semibold"><Phone size={12} className="me-1" />{selectedTx.telefono}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn btn-sm btn-outline-secondary p-1 rounded-circle"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeline Interactivo */}
            <div className="py-3 mb-4 bg-elevated rounded-3 p-3 border border-border">
              <h6 className="font-montserrat fw-bold text-text small mb-3">Línea de Tiempo de Fabricación y Entrega:</h6>
              <PedidoTimeline
                estado={selectedTx.estado}
                fechaCreacion={selectedTx.creado_en}
                fechaPago={selectedTx.pagado_en}
              />
            </div>

            {/* Cambiar Estado Rápido en Modal */}
            <div className="p-3 bg-elevated rounded-3 border border-border mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div>
                <span className="font-montserrat fw-bold text-text small d-block">Modificar Estado Actual:</span>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
                  El cambio notificará al cliente por correo y actualizará su portal.
                </span>
              </div>
              <select
                value={selectedTx.estado}
                onChange={(e) => handleCambiarEstado(selectedTx.numero, e.target.value)}
                className="form-select form-select-sm bg-surface text-text border-primary font-montserrat fw-bold w-auto"
              >
                {ESTADOS_DISPONIBLES.map((est) => (
                  <option key={est.key} value={est.key}>
                    {est.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Datos de Despacho y Contacto Completo */}
            {selectedTx.direccion && (
              <div className="p-3 bg-elevated rounded-3 border border-border mb-3 font-montserrat small">
                <span className="fw-bold text-text d-block mb-1">📍 Datos de Envío & Contacto:</span>
                <div className="text-muted">
                  {selectedTx.direccion}, {selectedTx.comuna}, {selectedTx.ciudad} ({selectedTx.region})
                </div>
                {selectedTx.telefono && (
                  <div className="text-primary mt-1 fw-semibold">📞 Teléfono de Despacho: {selectedTx.telefono}</div>
                )}
              </div>
            )}

            {/* Desglose Financiero */}
            <div className="row g-2 mb-3 font-montserrat small">
              <div className="col-4">
                <div className="p-2 rounded-2 bg-elevated border border-border text-center">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Total Bruto</span>
                  <strong className="text-text">{formatPrice(selectedTx.total)}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 rounded-2 bg-elevated border border-border text-center">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Comisión Pasarela</span>
                  <strong className="text-warning">-{formatPrice(selectedTx.comision_mp || 0)}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 rounded-2 bg-elevated border border-border text-center">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Ingreso Líquido</span>
                  <strong className="text-success">{formatPrice(selectedTx.monto_neto ?? (selectedTx.total - (selectedTx.comision_mp || 0)))}</strong>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                onClick={() => {
                  const freshTx = data?.ultimas_transacciones?.find((t) => t.numero === selectedTx.numero) || selectedTx;
                  setHistoryTx(freshTx);
                  setModalNuevoEstado(freshTx.estado);
                  setSelectedTx(null);
                }}
                className="btn btn-outline-secondary btn-sm font-montserrat d-flex align-items-center gap-1"
              >
                <History size={14} />
                <span>Ver Historial Detallado</span>
              </button>
              <button onClick={() => setSelectedTx(null)} className="btn btn-secondary btn-sm font-montserrat px-4">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Historial Detallado de Cambios de Estado & Notificación */}
      {historyTx && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1070, backdropFilter: 'blur(6px)' }}
          onClick={() => setHistoryTx(null)}
        >
          <div
            className="bg-surface border border-border rounded-4 p-4 shadow-lg w-100 animate-tab-fade"
            style={{ maxWidth: '44rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between border-bottom border-border pb-3 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <History size={20} className="text-primary" />
                  <h4 className="font-montserrat fw-bold text-text fs-5 mb-0">
                    Historial de Cambios: <span className="text-primary">{historyTx.numero}</span>
                  </h4>
                </div>
                <p className="font-montserrat text-muted small mb-0 mt-1">
                  Cliente: {historyTx.nombre} | 📧 {historyTx.email} {historyTx.telefono ? `| 📞 ${historyTx.telefono}` : ''}
                </p>
              </div>
              <button
                onClick={() => setHistoryTx(null)}
                className="btn btn-sm btn-outline-secondary p-1 rounded-circle"
              >
                <X size={18} />
              </button>
            </div>

            {/* Listado de Eventos del Historial */}
            <div className="mb-4">
              <h6 className="font-montserrat fw-bold text-text small mb-3">Registro Cronológico de Eventos:</h6>
              {(!historyTx.historial_estados || historyTx.historial_estados.length === 0) ? (
                <div className="p-3 bg-elevated rounded-3 border border-border font-montserrat small text-muted">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold text-text">Creación Inicial del Pedido</span>
                    {renderEstadoBadge(historyTx.estado)}
                  </div>
                  <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                    Fecha: {new Date(historyTx.creado_en).toLocaleString('es-CL')} | Autor: Sistema RC Estampa
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {/* Evento inicial de creación */}
                  <div className="p-3 bg-elevated rounded-3 border border-border font-montserrat small">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-semibold text-text">1. Creación de Orden</span>
                      <span className="badge bg-secondary bg-opacity-20 text-secondary border border-secondary text-uppercase">Inicio</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Fecha: {new Date(historyTx.creado_en).toLocaleString('es-CL')} | Autor: Cliente ({historyTx.nombre})
                    </div>
                  </div>

                  {/* Eventos registrados con badges claros en Dark/Light */}
                  {historyTx.historial_estados.map((h: any, idx: number) => {
                    return (
                      <div key={idx} className="p-3 bg-elevated rounded-3 border border-border font-montserrat small hover-lift">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold text-text">
                            {idx + 2}. Cambio de Estado:
                          </span>
                          <div className="d-flex align-items-center gap-1">
                            {h.estado_anterior && (
                              <>
                                {renderEstadoBadge(h.estado_anterior)}
                                <span className="text-muted">→</span>
                              </>
                            )}
                            {renderEstadoBadge(h.estado_nuevo)}
                          </div>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          📅 {new Date(h.fecha).toLocaleString('es-CL')} | 👤 Modificado por: <strong className="text-text">{h.autor || 'Admin'}</strong>
                        </div>
                        {h.nota && (
                          <div className="p-2 mt-2 bg-surface rounded-2 border border-border text-primary" style={{ fontSize: '0.78rem' }}>
                            💬 <strong>Observación:</strong> {h.nota}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulario de Transición de Estado con Nota y Disparo de Correo */}
            <div className="p-3 bg-elevated rounded-3 border border-border mb-3 font-montserrat">
              <h6 className="fw-bold text-text small mb-2 d-flex align-items-center gap-2">
                <Send size={14} className="text-primary" />
                Registrar Nuevo Cambio & Notificar al Cliente:
              </h6>
              <div className="row g-2 align-items-center mb-2">
                <div className="col-12 col-sm-6">
                  <label className="small text-muted mb-1 d-block" style={{ fontSize: '0.75rem' }}>Nuevo Estado:</label>
                  <select
                    value={modalNuevoEstado}
                    onChange={(e) => setModalNuevoEstado(e.target.value)}
                    className="form-select form-select-sm bg-surface text-text border-primary fw-bold"
                  >
                    {ESTADOS_DISPONIBLES.map((est) => (
                      <option key={est.key} value={est.key}>
                        {est.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="small text-muted mb-1 d-block" style={{ fontSize: '0.75rem' }}>Observación / Nota para el Cliente:</label>
                  <input
                    type="text"
                    value={notaCambio}
                    onChange={(e) => setNotaCambio(e.target.value)}
                    placeholder="Ej. Despachado por Blue Express N° 12345"
                    className="form-control form-control-sm bg-surface text-text border-border"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  onClick={() => handleCambiarEstado(historyTx.numero, modalNuevoEstado, notaCambio)}
                  disabled={updatingNumero === historyTx.numero || modalNuevoEstado === historyTx.estado}
                  className="btn btn-sm btn-primary font-montserrat fw-bold d-flex align-items-center gap-1"
                >
                  <Send size={13} />
                  <span>{updatingNumero === historyTx.numero ? 'Guardando...' : 'Aplicar Estado & Enviar Correo'}</span>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button onClick={() => setHistoryTx(null)} className="btn btn-secondary btn-sm font-montserrat px-4">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
