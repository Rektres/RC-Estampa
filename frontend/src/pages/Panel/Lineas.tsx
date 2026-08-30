import { useState, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Shirt,
  Coffee,
  Tags,
  Check,
  X,
  AlertCircle,
  Search,
} from 'lucide-react';
import { panelApi, type LineaInfo } from '../../api';
import { useAsync } from '../../api/hooks';
import LineaBadge from '../../components/shared/LineaBadge';

export default function Lineas() {
  const [reload, setReload] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLinea, setEditingLinea] = useState<LineaInfo | null>(null);
  const [nombreLinea, setNombreLinea] = useState('');
  const [toDelete, setToDelete] = useState<LineaInfo | null>(null);
  const [reassignTo, setReassignTo] = useState('urbana');
  const [busqueda, setBusqueda] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: lineasData, loading } = useAsync<LineaInfo[]>(
    () => panelApi.lineas.list(),
    [reload]
  );

  const lineas = Array.isArray(lineasData) ? lineasData : [];

  const filtered = useMemo(() => {
    if (!busqueda.trim()) return lineas;
    const q = busqueda.toLowerCase().trim();
    return lineas.filter(
      (l) => l.nombre.toLowerCase().includes(q) || l.linea.toLowerCase().includes(q)
    );
  }, [lineas, busqueda]);

  const refresh = () => setReload((n) => n + 1);

  function openNueva() {
    setEditingLinea(null);
    setNombreLinea('');
    setError(null);
    setModalOpen(true);
  }

  function openEditar(l: LineaInfo) {
    setEditingLinea(l);
    setNombreLinea(l.nombre);
    setError(null);
    setModalOpen(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreLinea.trim()) {
      setError('El nombre de la línea no puede estar vacío.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const slug = nombreLinea
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await panelApi.lineas.save({
        old_linea: editingLinea?.linea,
        new_linea: slug,
      });

      setModalOpen(false);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo guardar la línea.');
    } finally {
      setBusy(false);
    }
  }

  async function handleEliminar() {
    if (!toDelete) return;
    setBusy(true);
    setError(null);
    try {
      await panelApi.lineas.remove(toDelete.linea, reassignTo);
      setToDelete(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo eliminar la línea.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="d-flex flex-column gap-4 font-montserrat">
      {/* Barra superior de controles */}
      <div className="p-3 bg-surface rounded-4 border border-border d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle p-2 bg-primary bg-opacity-15 text-primary border border-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="fs-5 fw-bold text-text mb-0">Gestión de Líneas & Colecciones</h2>
            <p className="text-muted small mb-0">
              Administra las colecciones principales (Urbana, Formal, Drinkware) y crea nuevas líneas personalizadas.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Buscador */}
          <div className="position-relative" style={{ minWidth: '180px' }}>
            <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar línea..."
              className="form-control form-control-sm bg-elevated text-text border-border ps-5"
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          <button
            onClick={openNueva}
            className="btn btn-primary btn-sm fw-bold d-inline-flex align-items-center gap-2 px-3 py-2"
          >
            <Plus size={15} />
            <span>Nueva Línea</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-0 d-flex align-items-center gap-2" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de Cards de Líneas */}
      {loading ? (
        <div className="py-5 text-center text-muted">Cargando líneas y colecciones...</div>
      ) : filtered.length === 0 ? (
        <div className="p-5 text-center bg-surface border border-border rounded-4">
          <Layers size={40} className="text-muted mb-2 mx-auto" />
          <h4 className="fs-6 text-text fw-bold">No se encontraron líneas</h4>
          <p className="text-muted small mb-0">Crea una nueva línea haciendo clic en "+ Nueva Línea".</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((l) => {
            const isStandard = ['urbana', 'formal', 'drinkware'].includes(l.linea);

            return (
              <div key={l.linea} className="col-12 col-sm-6 col-lg-4">
                <div className="p-4 rounded-4 bg-surface border border-border shadow-sm h-100 d-flex flex-column justify-content-between hover-lift position-relative">
                  <div>
                    {/* Header de la Card */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <LineaBadge linea={l.linea} size="sm" />
                      <span className="badge bg-elevated text-muted border border-border" style={{ fontSize: '0.7rem' }}>
                        {isStandard ? 'Estándar Sistema' : 'Colección Custom'}
                      </span>
                    </div>

                    <h3 className="fs-5 fw-bold text-text mb-1">{l.nombre}</h3>
                    <p className="text-muted small mb-3">
                      Código identificador: <code className="text-primary">{l.linea}</code>
                    </p>

                    {/* Métricas de la Línea */}
                    <div className="d-flex flex-column gap-2 p-3 bg-elevated rounded-3 border border-border mb-3">
                      <div className="d-flex align-items-center justify-content-between small">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Shirt size={14} className="text-primary" /> Ropa Textil:
                        </span>
                        <strong className="text-text">{l.total_ropa} prod.</strong>
                      </div>
                      <div className="d-flex align-items-center justify-content-between small">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Coffee size={14} className="text-drinkware" /> Drinkware:
                        </span>
                        <strong className="text-text">{l.total_drinkware} prod.</strong>
                      </div>
                      <div className="d-flex align-items-center justify-content-between small pt-2 border-top border-border">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Tags size={14} /> Categorías Asociadas:
                        </span>
                        <strong className="text-text">{l.total_categorias}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-top border-border d-flex align-items-center justify-content-between">
                    <span className="text-primary fw-bold small">
                      Total: {l.total_productos} producto{l.total_productos !== 1 ? 's' : ''}
                    </span>

                    <div className="d-flex align-items-center gap-1">
                      <button
                        onClick={() => openEditar(l)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2 py-1"
                        style={{ fontSize: '0.75rem' }}
                        title="Editar nombre de línea"
                      >
                        <Pencil size={13} /> <span>Editar</span>
                      </button>

                      {!isStandard && (
                        <button
                          onClick={() => setToDelete(l)}
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Eliminar Línea"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Línea */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Body className="p-4 bg-surface border border-border rounded-4 font-montserrat">
          <div className="d-flex align-items-center justify-content-between pb-2 border-bottom border-border mb-3">
            <h4 className="fs-5 fw-bold text-text mb-0">
              {editingLinea ? `Editar Línea: ${editingLinea.nombre}` : 'Crear Nueva Línea / Colección'}
            </h4>
            <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-link text-muted p-0">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleGuardar}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Nombre de la Línea *</label>
              <input
                type="text"
                value={nombreLinea}
                onChange={(e) => setNombreLinea(e.target.value)}
                placeholder="Ej. Colección Deportiva, Edición Limitada, Corporativa"
                className="form-control bg-elevated text-text border-border"
                required
                autoFocus
              />
              <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
                Al guardar, se actualizará el identificador en todos los productos y categorías asociados.
              </p>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary btn-sm px-3"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary btn-sm fw-bold px-4 d-flex align-items-center gap-1"
              >
                <Check size={15} />
                <span>{busy ? 'Guardando...' : 'Guardar Línea'}</span>
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal Confirmar Eliminación / Reasignación */}
      <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
        <Modal.Body className="p-4 bg-surface border border-border rounded-4 font-montserrat">
          <div className="d-flex align-items-center gap-2 text-danger mb-3">
            <AlertCircle size={24} />
            <h4 className="fs-5 fw-bold mb-0">Eliminar Línea</h4>
          </div>

          <p className="text-muted small mb-3">
            ¿Deseas eliminar la línea <strong className="text-text">{toDelete?.nombre}</strong>?
          </p>

          {toDelete && toDelete.total_productos > 0 && (
            <div className="mb-4 p-3 bg-elevated rounded-3 border border-border">
              <label className="form-label small fw-semibold text-text">
                Reasignar los <strong>{toDelete.total_productos} productos</strong> a:
              </label>
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="form-select form-select-sm bg-surface text-text border-border"
              >
                <option value="urbana">Línea Urbana</option>
                <option value="formal">Línea Formal</option>
                <option value="drinkware">Colección Drinkware</option>
              </select>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setToDelete(null)} className="btn btn-secondary btn-sm px-3">
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              disabled={busy}
              className="btn btn-danger btn-sm fw-bold px-4"
            >
              {busy ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
