import { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { panelApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { getLinaLabel } from '../../utils';
import type { Categoria } from '../../types';

const VACIA = { nombre: '', slug: '', linea: 'urbana' as Categoria['linea'] };

export default function Categorias() {
  const [reload, setReload] = useState(0);
  const [editando, setEditando] = useState<number | 'nueva' | null>(null);
  const [draft, setDraft] = useState(VACIA);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categorias, loading } = useAsync(() => panelApi.categorias.list(), [reload]);
  const refresh = () => { setReload((n) => n + 1); setEditando(null); };

  function startEdit(c: Categoria) {
    setEditando(c.id);
    setDraft({ nombre: c.nombre, slug: c.slug, linea: c.linea });
    setError(null);
  }

  async function guardar() {
    if (!draft.nombre || !draft.slug) {
      setError('Nombre y slug son requeridos.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editando === 'nueva') await panelApi.categorias.create(draft);
      else if (typeof editando === 'number') await panelApi.categorias.update(editando, draft);
      refresh();
    } catch {
      setError('No se pudo guardar (¿slug duplicado?).');
    } finally {
      setBusy(false);
    }
  }

  async function eliminar(c: Categoria) {
    setBusy(true);
    setError(null);
    try {
      await panelApi.categorias.remove(c.id);
      refresh();
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'No se pudo eliminar la categoría.');
    } finally {
      setBusy(false);
    }
  }

  const celdasEdicion = (
    <>
      <td>
        <input
          value={draft.nombre}
          onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
          className="form-control form-control-sm bg-surface font-montserrat"
          placeholder="Nombre"
          autoFocus
        />
      </td>
      <td>
        <input
          value={draft.slug}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          className="form-control form-control-sm bg-surface font-montserrat"
          placeholder="slug-url"
        />
      </td>
      <td>
        <select
          value={draft.linea}
          onChange={(e) => setDraft({ ...draft, linea: e.target.value as Categoria['linea'] })}
          className="form-select form-select-sm bg-surface font-montserrat"
        >
          <option value="urbana">Urbana</option>
          <option value="formal">Formal</option>
          <option value="drinkware">Drinkware</option>
        </select>
      </td>
      <td className="text-end text-nowrap">
        <button onClick={guardar} disabled={busy} className="btn btn-link p-1 text-primary" title="Guardar">
          <Check size={16} />
        </button>
        <button onClick={() => setEditando(null)} className="btn btn-link p-1 text-muted" title="Cancelar">
          <X size={16} />
        </button>
      </td>
    </>
  );

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <button
          onClick={() => { setEditando('nueva'); setDraft(VACIA); setError(null); }}
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 font-montserrat" style={{ fontSize: '0.875rem' }}>{error}</div>}

      {loading ? (
        <p className="font-montserrat text-muted">Cargando...</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle font-montserrat" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Línea</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {editando === 'nueva' && <tr className="bg-elevated">{celdasEdicion}</tr>}
              {(categorias ?? []).map((c) =>
                editando === c.id ? (
                  <tr key={c.id} className="bg-elevated">{celdasEdicion}</tr>
                ) : (
                  <tr key={c.id}>
                    <td className="text-text">{c.nombre}</td>
                    <td className="text-muted">{c.slug}</td>
                    <td className="text-muted">{c.linea ? getLinaLabel(c.linea) : '—'}</td>
                    <td className="text-end text-nowrap">
                      <button onClick={() => startEdit(c)} className="btn btn-link p-1 text-muted" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => eliminar(c)} disabled={busy} className="btn btn-link p-1 text-danger" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              )}
              {(categorias ?? []).length === 0 && editando !== 'nueva' && (
                <tr><td colSpan={4} className="text-center text-muted py-4">Sin categorías.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
