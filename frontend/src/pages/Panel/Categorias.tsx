import { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  X,
  Check,
  FolderPlus,
  Package,
  Layers,
  Search,
  AlertCircle,
  Tag,
  Info,
} from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { panelApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { startCategoriaModalTour } from '../../utils/panelTour';
import LineaBadge from '../../components/shared/LineaBadge';
import type { Categoria } from '../../types';

const VACIA = { nombre: '', slug: '', linea: 'urbana' as Categoria['linea'] };

export default function Categorias() {
  const [reload, setReload] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<number | 'nueva' | null>(null);
  const [draft, setDraft] = useState(VACIA);
  const [toDelete, setToDelete] = useState<Categoria | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroLinea, setFiltroLinea] = useState<string>('todas');
  const [sortColumn, setSortColumn] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categorias, loading } = useAsync(() => panelApi.categorias.list(), [reload]);
  const { data: lineasData } = useAsync(() => panelApi.lineas.list(), [reload]);

  const lineasExistentes = Array.isArray(lineasData) ? lineasData : [];

  const refresh = () => {
    setReload((n) => n + 1);
    setEditando(null);
    setModalOpen(false);
    setDraft(VACIA);
    setToDelete(null);
  };

  function openNueva() {
    setEditando('nueva');
    const primeraLinea = lineasExistentes[0]?.linea || 'urbana';
    setDraft({ ...VACIA, linea: primeraLinea as any });
    setError(null);
    setModalOpen(true);
  }

  function startEdit(c: Categoria) {
    setEditando(c.id);
    setDraft({ nombre: c.nombre, slug: c.slug, linea: c.linea });
    setError(null);
    setModalOpen(true);
  }

  function handleNombreChange(val: string) {
    if (editando === 'nueva') {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setDraft({ ...draft, nombre: val, slug: generatedSlug });
    } else {
      setDraft({ ...draft, nombre: val });
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.nombre || !draft.slug) {
      setError('Nombre y slug son requeridos.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editando === 'nueva') {
        await panelApi.categorias.create(draft);
      } else if (typeof editando === 'number') {
        await panelApi.categorias.update(editando, draft);
      }
      refresh();
    } catch {
      setError('No se pudo guardar la categoría. Comprueba que el slug no esté duplicado.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    setError(null);
    try {
      await panelApi.categorias.remove(toDelete.id);
      refresh();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(detail ?? 'No se pudo eliminar la categoría (podría tener productos asignados).');
    } finally {
      setBusy(false);
    }
  }

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const categoriasFiltradas = useMemo(() => {
    if (!categorias) return [];
    const q = busqueda.toLowerCase().trim();
    const filtered = categorias.filter((c) => {
      const matchBusqueda = !q || c.nombre.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
      const matchLinea = filtroLinea === 'todas' || c.linea === filtroLinea;
      return matchBusqueda && matchLinea;
    });

    return filtered.sort((a, b) => {
      let valA: any = a[sortColumn as keyof Categoria];
      let valB: any = b[sortColumn as keyof Categoria];

      if (sortColumn === 'total_productos') {
        valA = a.total_productos || 0;
        valB = b.total_productos || 0;
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
  }, [categorias, busqueda, filtroLinea, sortColumn, sortDirection]);

  return (
    <div id="tour-categorias-container" className="d-flex flex-column gap-4 animate-tab-fade font-montserrat">
      {/* Header & Controles de Categorías */}
      <div className="p-3 p-md-4 rounded-4 bg-surface border border-border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle p-2 bg-primary bg-opacity-15 text-primary border border-primary">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="fs-5 fw-bold text-text mb-0">Gestión de Categorías</h2>
            <p className="small text-muted mb-0">
              Administra las categorías de catálogo asociadas a cada línea de producto.
            </p>
          </div>
        </div>

        <button
          onClick={openNueva}
          className="btn btn-primary fw-bold d-inline-flex align-items-center gap-2 px-3 py-2"
        >
          <FolderPlus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-0 d-flex align-items-center gap-2" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros Dinámica con Líneas Reales */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 bg-surface border border-border">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Buscador */}
          <div className="position-relative" style={{ minWidth: '200px' }}>
            <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar categoría..."
              className="form-control form-control-sm bg-elevated text-text border-border ps-5"
              style={{ fontSize: '0.8rem' }}
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

          {/* Filtro por Líneas Existentes */}
          <div className="btn-group btn-group-sm bg-elevated rounded-3 p-1 border border-border">
            <button
              onClick={() => setFiltroLinea('todas')}
              className={`btn btn-sm border-0 ${
                filtroLinea === 'todas' ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              Todas
            </button>
            {lineasExistentes.map((item) => (
              <button
                key={item.linea}
                onClick={() => setFiltroLinea(item.linea)}
                className={`btn btn-sm border-0 ${
                  filtroLinea === item.linea ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {item.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Ordenamiento */}
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Ordenar:</span>
          <button
            onClick={() => handleSort('nombre')}
            className={`btn btn-sm ${sortColumn === 'nombre' ? 'btn-outline-primary fw-bold' : 'btn-outline-secondary'} py-1 px-2`}
            style={{ fontSize: '0.75rem' }}
          >
            Nombre {sortColumn === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('total_productos')}
            className={`btn btn-sm ${sortColumn === 'total_productos' ? 'btn-outline-primary fw-bold' : 'btn-outline-secondary'} py-1 px-2`}
            style={{ fontSize: '0.75rem' }}
          >
            Productos {sortColumn === 'total_productos' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Grid de Cards de Categorías */}
      {loading ? (
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="p-4 rounded-4 bg-surface border border-border shadow-sm">
                <div className="skeleton-shimmer mb-3" style={{ width: '70%', height: '24px' }} />
                <div className="skeleton-shimmer mb-2" style={{ width: '40%', height: '18px' }} />
                <div className="skeleton-shimmer" style={{ width: '50%', height: '16px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="p-5 text-center bg-surface border border-border rounded-4">
          <Layers size={40} className="text-muted mb-2 mx-auto" />
          <h4 className="fs-6 text-text fw-bold">No se encontraron categorías</h4>
          <p className="text-muted small mb-3">Prueba cambiando los filtros o crea una nueva categoría.</p>
          <button onClick={openNueva} className="btn btn-primary btn-sm fw-bold px-3 py-2">
            + Crear Primera Categoría
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {categoriasFiltradas.map((c) => {
            const count = c.total_productos || 0;

            return (
              <div key={c.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="p-4 rounded-4 bg-surface border border-border shadow-sm h-100 d-flex flex-column justify-content-between hover-lift position-relative">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <LineaBadge linea={c.linea} size="xs" />

                      <div className="d-flex align-items-center gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="btn btn-sm btn-link p-1 text-muted hover-text-primary"
                          title="Editar Categoría"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setToDelete(c)}
                          className="btn btn-sm btn-link p-1 text-danger"
                          title="Eliminar Categoría"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3 className="fs-6 fw-bold text-text mb-1 text-truncate" title={c.nombre}>
                      {c.nombre}
                    </h3>
                    <code className="text-primary small d-block mb-3" style={{ fontSize: '0.75rem' }}>
                      /{c.slug}
                    </code>
                  </div>

                  <div className="pt-3 border-top border-border d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                      <Package size={13} className="text-primary" />
                      <strong>{count}</strong> {count === 1 ? 'producto' : 'productos'}
                    </span>
                    <button
                      onClick={() => startEdit(c)}
                      className="btn btn-sm btn-outline-primary py-1 px-2 fw-semibold"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Categoría */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered backdrop="static">
        <Modal.Body className="p-4 bg-surface border border-border rounded-4 font-montserrat">
          <div id="tour-modal-cat-header" className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-4">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-circle bg-primary bg-opacity-15 text-primary border border-primary">
                <Tag size={18} />
              </div>
              <h4 className="fs-5 fw-bold text-text mb-0">
                {editando === 'nueva' ? 'Crear Nueva Categoría' : 'Editar Categoría'}
              </h4>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={startCategoriaModalTour}
                className="btn btn-sm btn-outline-primary p-1 rounded-circle d-flex align-items-center justify-content-center hover-lift"
                style={{ width: '30px', height: '30px' }}
                title="Guía informativa de categoría"
                aria-label="Guía informativa de categoría"
              >
                <Info size={16} />
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-sm btn-outline-secondary p-1 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '30px', height: '30px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form id="tour-modal-cat-form" onSubmit={guardar} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label text-muted small fw-semibold">Nombre de la Categoría *</label>
              <input
                type="text"
                value={draft.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                placeholder="Ej. Polerones Oversize, Tazas Térmicas"
                className="form-control bg-elevated text-text border-border"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label text-muted small fw-semibold">Slug URL (Identificador único) *</label>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="polerones-oversize"
                className="form-control bg-elevated text-text border-border"
                required
              />
            </div>

            <div>
              <label className="form-label text-muted small fw-semibold">Línea / Colección Existente *</label>
              <select
                value={draft.linea}
                onChange={(e) => setDraft({ ...draft, linea: e.target.value as any })}
                className="form-select bg-elevated text-text border-border"
                required
              >
                {lineasExistentes.map((l) => (
                  <option key={l.linea} value={l.linea}>
                    {l.nombre} ({l.total_productos} prod.)
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top border-border mt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary btn-sm px-3 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary btn-sm fw-bold px-4 py-2 d-flex align-items-center gap-2"
              >
                <Check size={16} />
                <span>{busy ? 'Guardando...' : 'Guardar Categoría'}</span>
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal Confirmación de Eliminación */}
      <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
        <Modal.Body className="p-4 bg-surface border border-border rounded-4 font-montserrat">
          <h4 className="fs-5 fw-bold text-danger mb-2">Eliminar Categoría</h4>
          <p className="text-muted small mb-4">
            ¿Estás seguro de eliminar la categoría <strong className="text-text">{toDelete?.nombre}</strong>?
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
