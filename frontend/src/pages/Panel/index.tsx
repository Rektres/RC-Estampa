import { useMemo, useState } from 'react';
import { Table, Modal } from 'react-bootstrap';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Shirt,
  Coffee,
  Tags,
  Sparkles,
  LayoutList,
  LayoutGrid,
  Search,
  X,
  FileSpreadsheet,
  ShoppingBag,
} from 'lucide-react';
import { panelApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import Categorias from './Categorias';
import Lineas from './Lineas';
import Estadisticas from './Estadisticas';
import ProductoModalForm from './ProductoModalForm';
import type { Producto, ProductoVajilla } from '../../types';

type Tab = 'estadisticas' | 'ropa' | 'drinkware' | 'categorias' | 'lineas';

const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'estadisticas', label: 'Estadísticas & Ventas', icon: BarChart3 },
  { key: 'ropa', label: 'Ropa Textil', icon: Shirt },
  { key: 'drinkware', label: 'Colección Drinkware', icon: Coffee },
  { key: 'categorias', label: 'Categorías', icon: Tags },
  { key: 'lineas', label: 'Líneas & Colecciones', icon: Sparkles },
];

export default function Panel() {
  const [tab, setTab] = useState<Tab>('estadisticas');
  const [reload, setReload] = useState(0);

  // Modo de visualización: Tabla vs Cards
  const [modoVista, setModoVista] = useState<'tabla' | 'cards'>('tabla');

  // Filtros
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [stockFilter, setStockFilter] = useState<'todos' | 'con_stock' | 'sin_stock'>('todos');
  const [charFilter, setCharFilter] = useState<'todos' | 'destacado' | 'nuevo' | 'oferta'>('todos');

  // Ordenamiento de columnas
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modales y estados de acción
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Producto | ProductoVajilla | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const recurso = tab === 'drinkware' ? panelApi.drinkware : panelApi.productos;

  const { data: items, loading } = useAsync<(Producto | ProductoVajilla)[]>(
    () => (tab === 'categorias' || tab === 'estadisticas' || tab === 'lineas' ? Promise.resolve([]) : recurso.list()),
    [tab, reload]
  );

  const categoriasEnUso = useMemo(
    () => [...new Set((items ?? []).map((p) => p.categoria?.nombre).filter(Boolean) as string[])].sort(),
    [items]
  );

  // Filtrado reactivo con búsqueda multi-palabra y filtros avanzados
  const filtered = useMemo(() => {
    return (items ?? []).filter((p) => {
      // 1. Categoría
      if (catFilter && p.categoria?.nombre !== catFilter) return false;

      // 2. Estado Activo/Inactivo
      if (statusFilter === 'activos' && !p.activo) return false;
      if (statusFilter === 'inactivos' && p.activo) return false;

      // 3. Stock
      const stockTotal = (p.variantes || []).reduce((s, v) => s + (v.stock || 0), 0);
      if (stockFilter === 'con_stock' && stockTotal <= 0) return false;
      if (stockFilter === 'sin_stock' && stockTotal > 0) return false;

      // 4. Características
      if (charFilter === 'destacado' && !p.destacado) return false;
      if (charFilter === 'nuevo' && !p.nuevo) return false;
      if (charFilter === 'oferta' && (!p.precio_oferta || p.precio_oferta >= p.precio)) return false;

      // 5. Búsqueda multi-palabra
      if (q.trim()) {
        const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchable = `${p.nombre} ${p.descripcion || ''} ${p.categoria?.nombre || ''} ${p.linea || ''}`.toLowerCase();
        if (!words.every((w) => searchable.includes(w))) return false;
      }

      return true;
    });
  }, [items, catFilter, statusFilter, stockFilter, charFilter, q]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortColumn as keyof typeof a];
      let valB: any = b[sortColumn as keyof typeof b];

      if (sortColumn === 'categoria') {
        valA = a.categoria?.nombre || '';
        valB = b.categoria?.nombre || '';
      } else if (sortColumn === 'stock') {
        valA = a.variantes?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
        valB = b.variantes?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortColumn, sortDirection]);

  const refresh = () => setReload((n) => n + 1);

  function openNuevoProducto() {
    setEditId(null);
    setModalOpen(true);
  }

  function openEditarProducto(id: number) {
    setEditId(id);
    setModalOpen(true);
  }

  async function handleExportExcel() {
    setIsExporting(true);
    try {
      await panelApi.exportarProductosExcel(tab === 'drinkware' ? 'drinkware' : 'ropa');
    } catch {
      alert('Error al exportar catálogo a Excel.');
    } finally {
      setIsExporting(false);
    }
  }

  async function toggleActivo(p: Producto | ProductoVajilla) {
    setBusy(true);
    setError(null);
    try {
      await recurso.setActivo(p.id, !p.activo);
      refresh();
    } catch {
      setError('No se pudo actualizar el estado del producto.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    setError(null);
    try {
      await recurso.remove(toDelete.id);
      setToDelete(null);
      refresh();
    } catch {
      setError('No se pudo eliminar el producto.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-xxl py-5 animate-tab-fade">
      {/* Header del Panel */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-2 border-bottom border-border">
        <div>
          <h1 className="font-italiana text-text mb-1 fs-2">Panel de Administración</h1>
          <p className="font-montserrat small text-muted mb-0">
            Control de inventario, estadísticas financieras y catálogo de productos RC Estampa.
          </p>
        </div>

        {(tab === 'ropa' || tab === 'drinkware') && (
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="btn btn-outline-success font-montserrat fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2"
              title="Exportar a Excel con hojas por categoría"
            >
              <FileSpreadsheet size={16} />
              <span>{isExporting ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>

            <button
              onClick={openNuevoProducto}
              className="btn btn-primary font-montserrat fw-bold d-inline-flex align-items-center gap-2 px-3 py-2"
            >
              <Plus size={16} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        )}
      </div>

      {/* Selector de Pestañas Principales con Separador Limpio */}
      <div className="d-flex gap-2 border-bottom border-border pb-3 mb-4 overflow-x-auto font-montserrat">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setQ('');
                setCatFilter('');
              }}
              className={`btn d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill text-nowrap fw-semibold small ${
                isActive ? 'btn-primary' : 'btn-ghost text-muted'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="alert alert-danger py-2 font-montserrat small mb-3" role="alert">
          {error}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑAS */}
      <div key={tab} className="animate-tab-fade">
        {tab === 'estadisticas' ? (
          <Estadisticas />
        ) : tab === 'categorias' ? (
          <Categorias />
        ) : tab === 'lineas' ? (
          <Lineas />
        ) : (
          <div className="d-flex flex-column gap-3">
            {/* Barra de Filtros y Selector de Modo de Vista */}
            <div className="p-3 bg-surface rounded-4 border border-border d-flex flex-column gap-3 font-montserrat shadow-sm">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Buscador Multi-palabra */}
                <div className="position-relative flex-grow-1" style={{ minWidth: '220px', maxWidth: '340px' }}>
                  <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar producto, línea, categoría..."
                    className="form-control form-control-sm bg-elevated text-text border-border ps-5"
                    style={{ fontSize: '0.8rem' }}
                  />
                  {q && (
                    <button
                      onClick={() => setQ('')}
                      className="btn btn-sm p-0 position-absolute text-muted border-0 bg-transparent"
                      style={{ right: '8px', top: '6px' }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Switcher de Vista: Tabla vs Cards */}
                <div className="btn-group btn-group-sm bg-elevated rounded-3 p-1 border border-border">
                  <button
                    onClick={() => setModoVista('tabla')}
                    className={`btn btn-sm border-0 d-inline-flex align-items-center gap-1 ${
                      modoVista === 'tabla' ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    title="Vista en Tabla"
                  >
                    <LayoutList size={14} /> <span>Lista</span>
                  </button>
                  <button
                    onClick={() => setModoVista('cards')}
                    className={`btn btn-sm border-0 d-inline-flex align-items-center gap-1 ${
                      modoVista === 'cards' ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    title="Vista en Tarjetas"
                  >
                    <LayoutGrid size={14} /> <span>Cards</span>
                  </button>
                </div>
              </div>

              {/* Fila de Filtros Secundarios */}
              <div className="d-flex flex-wrap align-items-center gap-2 pt-2 border-top border-border">
                {/* Categoría */}
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="form-select form-select-sm bg-elevated text-text border-border w-auto"
                  style={{ fontSize: '0.75rem' }}
                >
                  <option value="">Todas las Categorías</option>
                  {categoriasEnUso.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Estado */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="form-select form-select-sm bg-elevated text-text border-border w-auto"
                  style={{ fontSize: '0.75rem' }}
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="activos">Solo Activos</option>
                  <option value="inactivos">Solo Deshabilitados</option>
                </select>

                {/* Stock */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="form-select form-select-sm bg-elevated text-text border-border w-auto"
                  style={{ fontSize: '0.75rem' }}
                >
                  <option value="todos">Todo el Stock</option>
                  <option value="con_stock">Con Stock (&gt;0)</option>
                  <option value="sin_stock">Agotados (0)</option>
                </select>

                {/* Características */}
                <select
                  value={charFilter}
                  onChange={(e) => setCharFilter(e.target.value as any)}
                  className="form-select form-select-sm bg-elevated text-text border-border w-auto"
                  style={{ fontSize: '0.75rem' }}
                >
                  <option value="todos">Todas las Características</option>
                  <option value="destacado">★ Destacados</option>
                  <option value="nuevo">✨ Nuevos Lanzamientos</option>
                  <option value="oferta">🏷️ En Oferta</option>
                </select>

                {(q || catFilter || statusFilter !== 'todos' || stockFilter !== 'todos' || charFilter !== 'todos') && (
                  <button
                    onClick={() => {
                      setQ('');
                      setCatFilter('');
                      setStatusFilter('todos');
                      setStockFilter('todos');
                      setCharFilter('todos');
                    }}
                    className="btn btn-sm btn-link text-primary p-0 ms-2 text-decoration-none small fw-semibold"
                  >
                    Limpiar Filtros
                  </button>
                )}

                <span className="text-muted small ms-auto">
                  <strong>{sorted.length}</strong> producto{sorted.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* VISTA 1: TABLA / LISTA */}
            {modoVista === 'tabla' && (
              loading ? (
                <div className="p-5 text-center text-muted font-montserrat">Cargando productos...</div>
              ) : (
                <div className="table-responsive bg-surface rounded-4 border border-border shadow-sm">
                  <Table hover className="align-middle font-montserrat mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead>
                      <tr className="text-muted text-uppercase user-select-none border-bottom border-border" style={{ fontSize: '0.75rem' }}>
                        <th style={{ width: '4rem' }} className="ps-3">Foto</th>
                        <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1">
                            <span>Producto</span>
                            {sortColumn === 'nombre' ? (sortDirection === 'asc' ? '↑' : '↓') : <span className="opacity-25">↕</span>}
                          </div>
                        </th>
                        <th onClick={() => handleSort('categoria')} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1">
                            <span>Categoría</span>
                            {sortColumn === 'categoria' ? (sortDirection === 'asc' ? '↑' : '↓') : <span className="opacity-25">↕</span>}
                          </div>
                        </th>
                        <th onClick={() => handleSort('precio')} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1">
                            <span>Precio</span>
                            {sortColumn === 'precio' ? (sortDirection === 'asc' ? '↑' : '↓') : <span className="opacity-25">↕</span>}
                          </div>
                        </th>
                        <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1">
                            <span>Stock</span>
                            {sortColumn === 'stock' ? (sortDirection === 'asc' ? '↑' : '↓') : <span className="opacity-25">↕</span>}
                          </div>
                        </th>
                        <th onClick={() => handleSort('activo')} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1">
                            <span>Estado</span>
                            {sortColumn === 'activo' ? (sortDirection === 'asc' ? '↑' : '↓') : <span className="opacity-25">↕</span>}
                          </div>
                        </th>
                        <th className="text-end pe-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((p) => {
                        const stockTotal = (p.variantes || []).reduce((s, v) => s + (v.stock || 0), 0);
                        const foto = p.imagenes?.[0]?.imagen;

                        return (
                          <tr key={p.id} style={p.activo ? undefined : { opacity: 0.55 }}>
                            <td className="ps-3" style={{ width: '4rem' }}>
                              <div className="rounded-3 bg-elevated border border-border overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '3.2rem', height: '3.2rem' }}>
                                {foto ? (
                                  <img src={foto} alt="" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                  <ShoppingBag size={18} className="text-muted" />
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="text-text fw-semibold d-block">{p.nombre}</span>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                <LineaBadge linea={p.linea} size="xs" />
                                {p.destacado && <span className="badge badge-luxury-destacado">★ Destacado</span>}
                                {p.nuevo && <span className="badge badge-luxury-nuevo">✨ Nuevo</span>}
                                {p.precio_oferta && <span className="badge badge-luxury-oferta">🏷️ Oferta</span>}
                              </div>
                            </td>
                            <td className="text-muted">{p.categoria?.nombre || '-'}</td>
                            <td>
                              <span className="text-primary fw-bold">{formatPrice(p.precio_oferta ?? p.precio)}</span>
                              {p.precio_oferta && (
                                <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.72rem' }}>
                                  {formatPrice(p.precio)}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${stockTotal > 0 ? 'badge-luxury-stock-ok' : 'badge-luxury-stock-empty'}`}>
                                {stockTotal} un.
                              </span>
                            </td>
                            <td>
                              {p.activo ? (
                                <span className="badge badge-status-pagado text-uppercase" style={{ fontSize: '0.7rem' }}>Activo</span>
                              ) : (
                                <span className="badge badge-status-pendiente text-uppercase" style={{ fontSize: '0.7rem' }}>Deshabilitado</span>
                              )}
                            </td>
                            <td className="text-end pe-3 text-nowrap">
                              <button
                                onClick={() => openEditarProducto(p.id)}
                                className="btn btn-sm btn-link p-1 text-muted hover-text-primary"
                                title="Editar Producto (Modal)"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => toggleActivo(p)}
                                disabled={busy}
                                className="btn btn-sm btn-link p-1 text-muted"
                                title={p.activo ? 'Deshabilitar' : 'Habilitar'}
                              >
                                {p.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                onClick={() => setToDelete(p)}
                                disabled={busy}
                                className="btn btn-sm btn-link p-1 text-danger"
                                title="Eliminar Producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {sorted.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-5">
                            No se encontraron productos con los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )
            )}

            {/* VISTA 2: CARDS / CUADRÍCULA */}
            {modoVista === 'cards' && (
              loading ? (
                <div className="row g-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="col-12 col-sm-6 col-md-4 col-xl-3">
                      <div className="p-3 rounded-4 bg-surface border border-border">
                        <div className="skeleton-shimmer mb-3" style={{ height: '180px', width: '100%' }} />
                        <div className="skeleton-shimmer mb-2" style={{ height: '20px', width: '80%' }} />
                        <div className="skeleton-shimmer" style={{ height: '16px', width: '40%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="p-5 text-center bg-surface border border-border rounded-4 font-montserrat">
                  <ShoppingBag size={40} className="text-muted mb-2 mx-auto" />
                  <h4 className="fs-6 text-text fw-bold">Sin productos coincidentes</h4>
                  <p className="text-muted small mb-0">Prueba cambiando los criterios de búsqueda.</p>
                </div>
              ) : (
                <div className="row g-3 font-montserrat">
                  {sorted.map((p) => {
                    const stockTotal = (p.variantes || []).reduce((s, v) => s + (v.stock || 0), 0);
                    const foto = p.imagenes?.[0]?.imagen;

                    return (
                      <div key={p.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                        <div
                          className="p-3 rounded-4 bg-surface border border-border shadow-sm h-100 d-flex flex-column justify-content-between hover-lift position-relative"
                          style={p.activo ? undefined : { opacity: 0.65 }}
                        >
                          <div>
                            {/* Imagen de la Card */}
                            <div className="rounded-3 bg-elevated border border-border mb-3 overflow-hidden position-relative" style={{ height: '13rem' }}>
                              {foto ? (
                                <img src={foto} alt={p.nombre} className="w-100 h-100 object-fit-cover" />
                              ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                  <ShoppingBag size={36} className="opacity-40" />
                                </div>
                              )}

                              {/* Badges superiores */}
                              <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                                <LineaBadge linea={p.linea} size="xs" />
                                {p.destacado && <span className="badge badge-luxury-destacado">★ Destacado</span>}
                                {p.nuevo && <span className="badge badge-luxury-nuevo">✨ Nuevo</span>}
                                {p.precio_oferta && <span className="badge badge-luxury-oferta">🏷️ Oferta</span>}
                              </div>

                              <div className="position-absolute top-0 end-0 m-2">
                                <span className={`badge ${stockTotal > 0 ? 'badge-luxury-stock-ok' : 'badge-luxury-stock-empty'}`}>
                                  Stock: {stockTotal}
                                </span>
                              </div>
                            </div>

                            <span className="text-muted small text-uppercase d-block mb-1" style={{ fontSize: '0.7rem' }}>
                              {p.categoria?.nombre || '-'}
                            </span>
                            <h3 className="fs-6 fw-bold text-text mb-2 text-truncate" title={p.nombre}>
                              {p.nombre}
                            </h3>
                          </div>

                          <div className="pt-3 border-top border-border">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <span className="text-primary fw-bold fs-6">{formatPrice(p.precio_oferta ?? p.precio)}</span>
                              {p.activo ? (
                                <span className="badge badge-status-pagado" style={{ fontSize: '0.68rem' }}>Activo</span>
                              ) : (
                                <span className="badge badge-status-pendiente" style={{ fontSize: '0.68rem' }}>Inactivo</span>
                              )}
                            </div>

                            {/* Acciones */}
                            <div className="d-flex align-items-center gap-1">
                              <button
                                onClick={() => openEditarProducto(p.id)}
                                className="btn btn-sm btn-outline-primary flex-grow-1 fw-bold d-inline-flex align-items-center justify-content-center gap-1 py-1"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <Pencil size={13} /> <span>Editar</span>
                              </button>
                              <button
                                onClick={() => toggleActivo(p)}
                                className="btn btn-sm btn-outline-secondary p-1"
                                title={p.activo ? 'Deshabilitar' : 'Habilitar'}
                              >
                                {p.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <button
                                onClick={() => setToDelete(p)}
                                className="btn btn-sm btn-outline-danger p-1"
                                title="Eliminar"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal de Creación / Edición de Producto */}
      <ProductoModalForm
        show={modalOpen}
        tipo={tab === 'drinkware' ? 'drinkware' : 'ropa'}
        productoId={editId}
        onHide={() => setModalOpen(false)}
        onSuccess={() => {
          refresh();
          setModalOpen(false);
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
        <Modal.Body className="p-4 bg-surface border border-border rounded-4 font-montserrat">
          <h4 className="fs-5 fw-bold text-danger mb-2">Eliminar Producto</h4>
          <p className="text-muted small mb-4">
            ¿Estás seguro de eliminar el producto <strong className="text-text">{toDelete?.nombre}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setToDelete(null)} className="btn btn-secondary btn-sm px-3">
              Cancelar
            </button>
            <button onClick={confirmDelete} disabled={busy} className="btn btn-danger btn-sm fw-bold px-4">
              {busy ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
