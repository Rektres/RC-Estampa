import { useState, useMemo } from 'react';
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
  Plus,
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
  { key: 'pagado', label: 'Pagado', color: 'success' },
  { key: 'en_proceso', label: 'En Proceso', color: 'warning' },
  { key: 'enviado', label: 'Enviado', color: 'info' },
  { key: 'entregado', label: 'Entregado', color: 'primary' },
  { key: 'pendiente', label: 'Pendiente', color: 'secondary' },
  { key: 'cancelado', label: 'Cancelado', color: 'danger' },
];

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('todo');
  const [reload, setReload] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingNumero, setUpdatingNumero] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Estados para Top Productos
  const [topProdsLimit, setTopProdsLimit] = useState(5);
  const [topProdsSearch, setTopProdsSearch] = useState('');

  const { data, loading, error } = useAsync<EstadisticasData>(
    () => panelApi.estadisticas(periodo),
    [periodo, reload]
  );

  const kpis = data?.kpis;

  // Filtrado y ordenamiento de Top Productos (Mayor a Menor)
  const topProductosFiltrados = useMemo(() => {
    if (!data?.top_productos) return [];
    const list = [...data.top_productos].sort(
      (a, b) => b.unidades_vendidas - a.unidades_vendidas || b.ingresos_totales - a.ingresos_totales
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

  // Filtrado reactivo de todos los pedidos
  const transaccionesFiltradas = useMemo(() => {
    if (!data?.ultimas_transacciones) return [];
    return data.ultimas_transacciones.filter((tx) => {
      const matchEstado = !estadoFiltro || tx.estado === estadoFiltro;
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        tx.numero.toLowerCase().includes(q) ||
        tx.nombre.toLowerCase().includes(q) ||
        tx.email.toLowerCase().includes(q) ||
        (tx.payment_method_id && tx.payment_method_id.toLowerCase().includes(q)) ||
        (tx.card_last_four && tx.card_last_four.includes(q));
      return matchEstado && matchBusqueda;
    });
  }, [data?.ultimas_transacciones, estadoFiltro, busqueda]);

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

  async function handleCambiarEstado(numero: string, nuevoEstado: string) {
    setUpdatingNumero(numero);
    try {
      await pedidosApi.cambiarEstado(numero, nuevoEstado);
      setReload((n) => n + 1);
      if (selectedTx && selectedTx.numero === numero) {
        setSelectedTx({ ...selectedTx, estado: nuevoEstado });
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingNumero(null);
    }
  }

  return (
    <div className="d-flex flex-column gap-4">
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
                onClick={() => setPeriodo(p.key)}
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

          {/* Fila 2: Embudo Dinámico e Interactivo de Pedidos */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <PackageCheck size={18} className="text-primary" />
                <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">
                  Embudo de Gestión de Pedidos por Estado
                </h3>
              </div>
              {estadoFiltro ? (
                <button
                  onClick={() => setEstadoFiltro(null)}
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 font-montserrat fw-semibold"
                  style={{ fontSize: '0.75rem' }}
                >
                  <X size={13} />
                  <span>Quitar filtro: {estadoFiltro.toUpperCase()} (Ver Todos)</span>
                </button>
              ) : (
                <span className="font-montserrat small text-muted" style={{ fontSize: '0.75rem' }}>
                  Haz clic en un estado para filtrar las órdenes abajo
                </span>
              )}
            </div>

            <div className="row g-2">
              {ESTADOS_DISPONIBLES.map((est) => {
                const count = kpis.conteo_estados[est.key] || 0;
                const isSelected = estadoFiltro === est.key;
                return (
                  <div key={est.key} className="col-6 col-sm-4 col-md-2">
                    <div
                      onClick={() => setEstadoFiltro(isSelected ? null : est.key)}
                      className={`p-3 rounded-3 text-center border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-elevated border-primary shadow-sm'
                          : 'bg-elevated border-border hover-lift'
                      }`}
                      style={{
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        borderWidth: isSelected ? '2px' : '1px',
                      }}
                    >
                      <span className="small text-muted d-block mb-1 font-montserrat">{est.label}</span>
                      <span className={`fs-5 fw-bold font-montserrat text-${est.color}`}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fila 3: Top Productos & Ventas por Línea */}
          <div className="row g-3">
            {/* Top Productos Ranking con Búsqueda y Paginación 'Cargar Más' */}
            <div className="col-12 col-lg-7">
              <div className="p-4 rounded-4 bg-surface border border-border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Sparkles size={18} className="text-primary" />
                      <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Top Productos Más Vendidos</h3>
                    </div>
                    <span className="badge bg-elevated text-muted border border-border font-montserrat">
                      Orden: Mayor a Menor
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
                        const maxUnits = topProductosFiltrados[0]?.unidades_vendidas || 1;
                        const pct = Math.round((prod.unidades_vendidas / maxUnits) * 100);
                        return (
                          <div key={idx} className="p-2 rounded-3 bg-elevated border border-border hover-lift">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary text-black fw-bold" style={{ fontSize: '0.7rem' }}>
                                  #{idx + 1}
                                </span>
                                <span className="font-montserrat fw-semibold text-text small">{prod.nombre}</span>
                                <span className="badge bg-dark text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>
                                  {prod.tipo}
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="font-montserrat fw-bold text-primary small me-2">{formatPrice(prod.ingresos_totales)}</span>
                                <span className="font-montserrat text-muted small">({prod.unidades_vendidas} un.)</span>
                              </div>
                            </div>
                            <div className="progress bg-dark" style={{ height: '5px' }}>
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

          {/* Fila 4: Búsqueda y Gestión de Pedidos en Vivo (TODOS LOS ESTADOS) */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Gestión de Pedidos & Trazabilidad</h3>
                <span className="badge bg-elevated text-primary border border-border ms-1 font-montserrat fw-bold">
                  {transaccionesFiltradas.length} órdenes visibles
                </span>
                {estadoFiltro && (
                  <span className="badge bg-primary text-black font-montserrat fw-bold">
                    Filtro: {estadoFiltro.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Input Buscador */}
              <div className="position-relative" style={{ minWidth: '260px', maxWidth: '380px' }}>
                <Search size={15} className="position-absolute text-muted" style={{ left: '12px', top: '10px' }} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por N° pedido, cliente, email..."
                  className="form-control form-control-sm bg-elevated text-text border-border ps-5 font-montserrat"
                  style={{ borderRadius: '8px' }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="btn btn-sm p-0 position-absolute text-muted border-0 bg-transparent"
                    style={{ right: '10px', top: '7px' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {transaccionesFiltradas.length === 0 ? (
              <div className="text-center py-5 text-muted small font-montserrat">
                No se encontraron pedidos con los filtros aplicados ({estadoFiltro ? `Estado: ${estadoFiltro}` : 'General'}).
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card-border-gold)' }}>
                      <th className="font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>N° Pedido</th>
                      <th className="font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Cliente & Contacto</th>
                      <th className="font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Medio / Tarjeta</th>
                      <th className="text-end font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Bruto</th>
                      <th className="text-end font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Comisión</th>
                      <th className="text-end font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Neto</th>
                      <th className="text-center font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Estado (Modificar)</th>
                      <th className="text-center font-montserrat fw-bold text-text small py-3" style={{ letterSpacing: '0.04em' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesFiltradas.map((tx) => (
                      <tr key={tx.numero} className="border-bottom border-border">
                        <td className="font-montserrat fw-bold text-primary small">
                          {tx.numero}
                        </td>
                        <td>
                          <div className="font-montserrat fw-semibold text-text small">{tx.nombre}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{tx.email}</div>
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
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2 font-montserrat"
                            style={{ fontSize: '0.75rem' }}
                            title="Ver trazabilidad y auditoría"
                          >
                            <Eye size={13} />
                            <span>Trazabilidad</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Trazabilidad y Detalle de Pedido */}
      {selectedTx && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060, backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-surface border border-border rounded-4 p-4 shadow-lg w-100"
            style={{ maxWidth: '44rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between border-bottom border-border pb-3 mb-3">
              <div>
                <h4 className="font-montserrat fw-bold text-text fs-5 mb-0">
                  Trazabilidad del Pedido: <span className="text-primary">{selectedTx.numero}</span>
                </h4>
                <p className="font-montserrat text-muted small mb-0">
                  Cliente: {selectedTx.nombre} ({selectedTx.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn btn-sm btn-outline-secondary p-1 rounded-circle"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeline Interactivo Corregido Geométricamente */}
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
                  El cambio se reflejará inmediatamente en la cuenta del cliente.
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

            {/* Datos de Despacho y Contacto */}
            {selectedTx.direccion && (
              <div className="p-3 bg-elevated rounded-3 border border-border mb-3 font-montserrat small">
                <span className="fw-bold text-text d-block mb-1">📍 Datos de Envío:</span>
                <div className="text-muted">
                  {selectedTx.direccion}, {selectedTx.comuna}, {selectedTx.ciudad} ({selectedTx.region})
                </div>
                {selectedTx.telefono && (
                  <div className="text-muted mt-1">📞 Teléfono: {selectedTx.telefono}</div>
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

            <div className="d-flex justify-content-end mt-3">
              <button onClick={() => setSelectedTx(null)} className="btn btn-secondary btn-sm font-montserrat px-4">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
