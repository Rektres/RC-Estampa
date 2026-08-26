import { useState } from 'react';
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
} from 'lucide-react';
import { panelApi, type EstadisticasData } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';

const PERIODOS = [
  { key: 'todo', label: 'Todo el tiempo' },
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
  { key: 'este_mes', label: 'Este mes' },
  { key: 'este_ano', label: 'Este año' },
];

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('todo');
  const [reload, setReload] = useState(0);

  const { data, loading, error } = useAsync<EstadisticasData>(
    () => panelApi.estadisticas(periodo),
    [periodo, reload]
  );

  const kpis = data?.kpis;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header & Filtro de Período */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4 bg-surface border border-border">
        <div>
          <div className="d-flex align-items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="fs-5 fw-bold font-montserrat text-text mb-0">Métricas & Rendimiento de Ventas</h2>
          </div>
          <p className="small text-muted mb-0 mt-1">
            Resumen en tiempo real de ingresos brutos, netos, productos estrella y pasarela.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
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

          <button
            onClick={() => setReload((n) => n + 1)}
            disabled={loading}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-center py-5 text-muted">
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
              <div className="p-3 rounded-4 bg-surface border border-border h-100 position-relative overflow-hidden">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-muted font-montserrat fw-semibold">Ventas Totales (Bruto)</span>
                  <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="fs-3 fw-bold font-montserrat text-primary mb-1">
                  {formatPrice(kpis.total_ventas_bruto)}
                </div>
                <div className="small text-muted">
                  {kpis.total_pedidos_pagados} {kpis.total_pedidos_pagados === 1 ? 'pedido pagado' : 'pedidos pagados'}
                </div>
              </div>
            </div>

            {/* Total Ingresos Netos */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-muted font-montserrat fw-semibold">Ingresos Netos Reales</span>
                  <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="fs-3 fw-bold font-montserrat text-success mb-1">
                  {formatPrice(kpis.total_ventas_neto)}
                </div>
                <div className="small text-muted">
                  Tras deducir comisiones de pasarela
                </div>
              </div>
            </div>

            {/* Comisiones Mercado Pago */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-muted font-montserrat fw-semibold">Comisiones Pasarela</span>
                  <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                    <CreditCard size={18} />
                  </div>
                </div>
                <div className="fs-3 fw-bold font-montserrat text-warning mb-1">
                  {formatPrice(kpis.total_comision_mp)}
                </div>
                <div className="small text-muted">
                  Comisión MP + IVA retenido
                </div>
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-muted font-montserrat fw-semibold">Ticket Promedio</span>
                  <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="fs-3 fw-bold font-montserrat text-text mb-1">
                  {formatPrice(kpis.ticket_promedio)}
                </div>
                <div className="small text-muted">
                  Conversión del {kpis.tasa_conversion}% ({kpis.total_pedidos_generados} creados)
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Top Productos y Desglose por Línea */}
          <div className="row g-4">
            {/* Top Productos */}
            <div className="col-12 col-lg-7">
              <div className="p-4 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Top Productos Más Vendidos</h3>
                  </div>
                  <span className="badge bg-elevated text-muted border border-border">Ranking por unidades</span>
                </div>

                {data.top_productos.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    Aún no se registran productos vendidos en este período.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                      <thead>
                        <tr className="text-muted small border-bottom border-border">
                          <th style={{ background: 'transparent' }}>Producto</th>
                          <th className="text-center" style={{ background: 'transparent' }}>Tipo</th>
                          <th className="text-center" style={{ background: 'transparent' }}>Unidades</th>
                          <th className="text-end" style={{ background: 'transparent' }}>Recaudación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.top_productos.map((prod, idx) => {
                          const maxUnidades = data.top_productos[0]?.unidades_vendidas || 1;
                          const pct = Math.round((prod.unidades_vendidas / maxUnidades) * 100);

                          return (
                            <tr key={`${prod.nombre}-${idx}`} className="border-bottom border-border">
                              <td style={{ background: 'transparent' }}>
                                <div className="d-flex align-items-center gap-2">
                                  {prod.imagen ? (
                                    <img
                                      src={prod.imagen}
                                      alt={prod.nombre}
                                      className="rounded-2 object-fit-cover border border-border"
                                      style={{ width: '36px', height: '36px' }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-2 bg-elevated border border-border d-flex align-items-center justify-content-center text-muted"
                                      style={{ width: '36px', height: '36px' }}
                                    >
                                      <Layers size={16} />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-montserrat fw-semibold text-text small">{prod.nombre}</div>
                                    <div className="progress mt-1" style={{ height: '4px', width: '120px', backgroundColor: '#222' }}>
                                      <div className="progress-bar bg-primary" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center" style={{ background: 'transparent' }}>
                                <span className="badge bg-elevated text-muted border border-border text-capitalize" style={{ fontSize: '0.7rem' }}>
                                  {prod.tipo || 'Catálogo'}
                                </span>
                              </td>
                              <td className="text-center font-montserrat fw-bold text-primary" style={{ background: 'transparent' }}>
                                {prod.unidades_vendidas}
                              </td>
                              <td className="text-end font-montserrat fw-semibold text-text" style={{ background: 'transparent' }}>
                                {formatPrice(prod.ingresos_totales)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Desglose por Línea de Producto */}
            <div className="col-12 col-lg-5">
              <div className="p-4 rounded-4 bg-surface border border-border h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Layers size={18} className="text-primary" />
                  <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Ventas por Línea</h3>
                </div>

                {data.ventas_por_linea.length === 0 ? (
                  <div className="text-center py-4 text-muted small my-auto">
                    Sin ventas registradas en las líneas de catálogo.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 my-auto">
                    {data.ventas_por_linea.map((l, i) => {
                      const totalIngresos = kpis.total_ventas_bruto || 1;
                      const pct = Math.round((l.ingresos / totalIngresos) * 100);

                      return (
                        <div key={i} className="p-3 rounded-3 bg-elevated border border-border">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="font-montserrat fw-bold text-text text-capitalize">
                              {l.linea === 'urbana' ? '👕 Ropa Urbana' : l.linea === 'formal' ? '👔 Línea Formal' : l.linea === 'drinkware' ? '☕ Drinkware' : l.linea}
                            </span>
                            <span className="font-montserrat fw-bold text-primary">
                              {formatPrice(l.ingresos)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
                            <span>{l.unidades} unidades</span>
                            <span>{pct}% del total</span>
                          </div>
                          <div className="progress" style={{ height: '6px', backgroundColor: '#1a1a1a' }}>
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
            </div>
          </div>

          {/* Fila 3: Medios de Pago & Distribución Geográfica */}
          <div className="row g-4">
            {/* Medios de Pago */}
            <div className="col-12 col-md-6">
              <div className="p-4 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-primary" />
                  <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Medios de Pago</h3>
                </div>

                {data.medios_pago.length === 0 ? (
                  <div className="text-center py-4 text-muted small">Sin transacciones registradas.</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {data.medios_pago.map((m, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 bg-elevated border border-border">
                        <div className="d-flex align-items-center gap-2">
                          <CreditCard size={16} className="text-muted" />
                          <span className="font-montserrat fw-semibold text-text small">{m.metodo}</span>
                        </div>
                        <div className="text-end">
                          <span className="font-montserrat fw-bold text-text small me-2">{formatPrice(m.total)}</span>
                          <span className="badge bg-dark text-muted border border-border">{m.conteo} órdenes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Geografía de Envíos */}
            <div className="col-12 col-md-6">
              <div className="p-4 rounded-4 bg-surface border border-border h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <MapPin size={18} className="text-primary" />
                  <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Despachos por Región</h3>
                </div>

                {data.ventas_por_region.length === 0 ? (
                  <div className="text-center py-4 text-muted small">Sin información de destinos.</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {data.ventas_por_region.map((r, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 bg-elevated border border-border">
                        <div className="d-flex align-items-center gap-2">
                          <MapPin size={16} className="text-primary" />
                          <span className="font-montserrat fw-semibold text-text small">{r.region}</span>
                        </div>
                        <div className="text-end">
                          <span className="font-montserrat fw-bold text-text small me-2">{formatPrice(r.total)}</span>
                          <span className="badge bg-dark text-muted border border-border">{r.conteo} envíos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fila 4: Estado Operativo de Pedidos */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PackageCheck size={18} className="text-primary" />
              <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Embudo de Gestión de Pedidos</h3>
            </div>

            <div className="row g-2">
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">Pagados</span>
                  <span className="fs-5 fw-bold font-montserrat text-success">{kpis.conteo_estados.pagado || 0}</span>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">En Proceso</span>
                  <span className="fs-5 fw-bold font-montserrat text-warning">{kpis.conteo_estados.en_proceso || 0}</span>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">Enviados</span>
                  <span className="fs-5 fw-bold font-montserrat text-info">{kpis.conteo_estados.enviado || 0}</span>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">Entregados</span>
                  <span className="fs-5 fw-bold font-montserrat text-primary">{kpis.conteo_estados.entregado || 0}</span>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">Pendientes</span>
                  <span className="fs-5 fw-bold font-montserrat text-muted">{kpis.conteo_estados.pendiente || 0}</span>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-3 rounded-3 bg-elevated text-center border border-border">
                  <span className="small text-muted d-block mb-1">Cancelados</span>
                  <span className="fs-5 fw-bold font-montserrat text-danger">{kpis.conteo_estados.cancelado || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 5: Últimas Transacciones Registradas */}
          <div className="p-4 rounded-4 bg-surface border border-border">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h3 className="fs-6 fw-bold font-montserrat text-text mb-0">Últimas Transacciones y Conciliación</h3>
              </div>
              <span className="badge bg-elevated text-muted border border-border">Auditoría en vivo</span>
            </div>

            {data.ultimas_transacciones.length === 0 ? (
              <div className="text-center py-4 text-muted small">Sin transacciones recientes.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted small border-bottom border-border">
                      <th style={{ background: 'transparent' }}>N° Pedido</th>
                      <th style={{ background: 'transparent' }}>Cliente</th>
                      <th style={{ background: 'transparent' }}>Medio / Tarjeta</th>
                      <th className="text-end" style={{ background: 'transparent' }}>Bruto</th>
                      <th className="text-end" style={{ background: 'transparent' }}>Comisión MP</th>
                      <th className="text-end" style={{ background: 'transparent' }}>Neto</th>
                      <th className="text-center" style={{ background: 'transparent' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimas_transacciones.map((tx) => (
                      <tr key={tx.numero} className="border-bottom border-border">
                        <td className="font-montserrat fw-bold text-primary small" style={{ background: 'transparent' }}>
                          {tx.numero}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <div className="font-montserrat fw-semibold text-text small">{tx.nombre}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{tx.email}</div>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <div className="d-flex align-items-center gap-1 small text-text">
                            <span className="text-uppercase fw-semibold">{tx.payment_method_id || tx.metodo_pago}</span>
                            {tx.card_last_four && (
                              <span className="text-muted">•••• {tx.card_last_four}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-end font-montserrat fw-bold text-text small" style={{ background: 'transparent' }}>
                          {formatPrice(tx.total)}
                        </td>
                        <td className="text-end font-montserrat text-warning small" style={{ background: 'transparent' }}>
                          -{formatPrice(tx.comision_mp || 0)}
                        </td>
                        <td className="text-end font-montserrat fw-bold text-success small" style={{ background: 'transparent' }}>
                          {formatPrice(tx.monto_neto ?? (tx.total - (tx.comision_mp || 0)))}
                        </td>
                        <td className="text-center" style={{ background: 'transparent' }}>
                          <span
                            className={`badge ${
                              tx.estado === 'pagado' || tx.estado === 'entregado'
                                ? 'bg-success bg-opacity-25 text-success border border-success'
                                : tx.estado === 'en_proceso' || tx.estado === 'enviado'
                                ? 'bg-info bg-opacity-25 text-info border border-info'
                                : 'bg-warning bg-opacity-25 text-warning border border-warning'
                            }`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {tx.estado}
                          </span>
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
    </div>
  );
}
