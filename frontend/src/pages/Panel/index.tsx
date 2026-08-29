import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Modal } from 'react-bootstrap';
import { Plus, Pencil, Trash2, Eye, EyeOff, BarChart3, Shirt, Coffee, Tags } from 'lucide-react';
import { panelApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import Categorias from './Categorias';
import Estadisticas from './Estadisticas';
import type { Producto, ProductoVajilla } from '../../types';

type Tab = 'estadisticas' | 'ropa' | 'drinkware' | 'categorias';

const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'estadisticas', label: 'Estadísticas & Ventas', icon: BarChart3 },
  { key: 'ropa', label: 'Ropa', icon: Shirt },
  { key: 'drinkware', label: 'Drinkware', icon: Coffee },
  { key: 'categorias', label: 'Categorías', icon: Tags },
];

export default function Panel() {
  const [tab, setTab] = useState<Tab>('estadisticas');
  const [reload, setReload] = useState(0);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [toDelete, setToDelete] = useState<Producto | ProductoVajilla | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recurso = tab === 'drinkware' ? panelApi.drinkware : panelApi.productos;

  const { data: items, loading } = useAsync<(Producto | ProductoVajilla)[]>(
    () => (tab === 'categorias' || tab === 'estadisticas' ? Promise.resolve([]) : recurso.list()),
    [tab, reload]
  );

  const categoriasEnUso = useMemo(
    () => [...new Set((items ?? []).map((p) => p.categoria?.nombre).filter(Boolean) as string[])].sort(),
    [items]
  );

  const filtered = (items ?? []).filter((p) => {
    if (catFilter && p.categoria?.nombre !== catFilter) return false;
    if (q && !p.nombre.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
        valA = a.variantes?.reduce((s, v) => s + v.stock, 0) || 0;
        valB = b.variantes?.reduce((s, v) => s + v.stock, 0) || 0;
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

  async function toggleActivo(p: Producto | ProductoVajilla) {
    setBusy(true);
    setError(null);
    try {
      await recurso.setActivo(p.id, !p.activo);
      refresh();
    } catch {
      setError('No se pudo actualizar el estado.');
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

  const tipoRuta = tab === 'drinkware' ? 'drinkware' : 'ropa';

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <h1 className="font-italiana text-text mb-0" style={{ fontSize: '2.25rem' }}>Panel de administración</h1>
        {(tab === 'ropa' || tab === 'drinkware') && (
          <Link to={`/panel/${tipoRuta}/nuevo`} className="btn btn-primary d-inline-flex align-items-center gap-2">
            <Plus size={16} />
            Nuevo producto
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom border-border mb-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setQ('');
                setCatFilter('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-montserrat fw-semibold px-3 py-2 bg-transparent border-0 border-bottom border-2 d-inline-flex align-items-center gap-2 text-nowrap ${
                tab === t.key ? 'text-primary border-primary' : 'text-muted'
              }`}
              style={tab === t.key ? undefined : { borderBottomColor: 'transparent' }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && <div className="alert alert-danger py-2 font-montserrat" style={{ fontSize: '0.875rem' }}>{error}</div>}

      <div key={tab} className="animate-tab-fade">
        {tab === 'estadisticas' ? (
          <Estadisticas />
        ) : tab === 'categorias' ? (
          <Categorias />
        ) : (
          <>
            {/* Filtros */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre..."
                className="form-control bg-elevated font-montserrat"
                style={{ maxWidth: '18rem' }}
              />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="form-select bg-elevated font-montserrat w-auto"
              >
                <option value="">Todas las categorías</option>
                {categoriasEnUso.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <p className="font-montserrat text-muted">Cargando...</p>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle font-montserrat" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr className="text-muted text-uppercase user-select-none" style={{ fontSize: '0.75rem' }}>
                      <th style={{ width: '3.5rem' }}>Foto</th>
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
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p) => {
                      const stockTotal = p.variantes.reduce((s, v) => s + v.stock, 0);
                      return (
                        <tr key={p.id} style={p.activo ? undefined : { opacity: 0.5 }}>
                          <td style={{ width: '3.5rem' }}>
                            <img
                              src={p.imagenes[0]?.imagen}
                              alt=""
                              className="rounded object-fit-cover"
                              style={{ width: '3rem', height: '3rem' }}
                            />
                          </td>
                          <td>
                            <span className="text-text fw-medium">{p.nombre}</span>
                            <div className="d-flex gap-1 mt-1">
                              <LineaBadge linea={p.linea} size="xs" />
                              {p.destacado && <span className="badge bg-primary-20 text-primary">Destacado</span>}
                              {p.nuevo && <span className="badge bg-drinkware-20 text-drinkware">Nuevo</span>}
                            </div>
                          </td>
                          <td className="text-muted">{p.categoria?.nombre || '-'}</td>
                          <td>
                            <span className="text-primary fw-semibold">{formatPrice(p.precio_oferta ?? p.precio)}</span>
                            {p.precio_oferta && (
                              <div className="text-ghost text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                                {formatPrice(p.precio)}
                              </div>
                            )}
                          </td>
                          <td className="text-muted">{stockTotal}</td>
                          <td>
                            {p.activo
                              ? <span className="badge bg-drinkware-20 text-drinkware">Activo</span>
                              : <span className="badge bg-elevated text-muted border border-border">Deshabilitado</span>}
                          </td>
                          <td className="text-end text-nowrap">
                            <Link
                              to={`/panel/${tipoRuta}/${p.id}`}
                              className="btn btn-link p-1 text-muted"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              onClick={() => toggleActivo(p)}
                              disabled={busy}
                              className="btn btn-link p-1 text-muted"
                              title={p.activo ? 'Deshabilitar' : 'Habilitar'}
                            >
                              {p.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              onClick={() => setToDelete(p)}
                              disabled={busy}
                              className="btn btn-link p-1 text-danger"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">Sin productos.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmación de borrado */}
      <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
        <Modal.Body className="p-4">
          <h3 className="font-italiana text-text fs-4 mb-3">Eliminar producto</h3>
          <p className="font-montserrat text-muted" style={{ fontSize: '0.875rem' }}>
            ¿Seguro que quieres eliminar <span className="text-text">{toDelete?.nombre}</span>?
            Esta acción no se puede deshacer. Si solo quieres ocultarlo de la tienda, usa "Deshabilitar".
          </p>
          <div className="d-flex gap-3 mt-4">
            <button onClick={confirmDelete} disabled={busy} className="btn btn-danger flex-grow-1">
              {busy ? 'Eliminando...' : 'Eliminar'}
            </button>
            <button onClick={() => setToDelete(null)} className="btn btn-secondary flex-grow-1">
              Cancelar
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
