import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Check, Search, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export interface FilterConfig {
  showLinea?: boolean;
  lineas?: { key: string; label: string }[];
  showCategoria?: boolean;
  categorias?: string[];
  showTalla?: boolean;
  tallas?: string[];
  showColor?: boolean;
  colores?: { nombre: string; hex: string }[];
  showMaterial?: boolean;
  materiales?: string[];
  showPrecio?: boolean;
  maxPrecio?: number;
}

interface Props {
  config: FilterConfig;
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-bottom border-border py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="d-flex align-items-center justify-content-between w-100 font-montserrat fw-semibold text-text text-uppercase small bg-transparent border-0 p-0 mb-2"
        style={{ letterSpacing: '0.05em' }}
      >
        {title}
        {open ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ config }: Props) {
  const [params, setParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(params.get('q') || '');

  function toggle(key: string, value: string) {
    const current = params.get(key)?.split(',').filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const updated = new URLSearchParams(params);
    if (next.length === 0) {
      updated.delete(key);
    } else {
      updated.set(key, next.join(','));
    }
    setParams(updated);
  }

  function set(key: string, value: string) {
    const updated = new URLSearchParams(params);
    if (value) updated.set(key, value);
    else updated.delete(key);
    setParams(updated);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    set('q', localSearch.trim());
  }

  function clear() {
    setLocalSearch('');
    setParams(new URLSearchParams());
  }

  const hasFilters = params.toString() !== '';
  const linea = params.get('linea') ?? '';
  const tallas = params.get('talla')?.split(',').filter(Boolean) ?? [];
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const materiales = params.get('material')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? config.maxPrecio ?? 80000);
  const soloDestacados = params.get('destacado') === '1';
  const soloNuevos = params.get('nuevo') === '1';
  const soloOferta = params.get('oferta') === '1';

  // Líneas dinámicas existentes
  const lineasOpciones = config.lineas && config.lineas.length > 0
    ? [{ key: '', label: 'Todas las Colecciones' }, ...config.lineas]
    : [
        { key: '', label: 'Todas las Colecciones' },
        { key: 'ropa', label: 'Ropa Textil' },
        { key: 'drinkware', label: 'Drinkware' },
      ];

  // Tallas con stock > 0
  const tallasOpciones = config.tallas ?? ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <aside className="w-100 font-montserrat">
      {/* Header Filtros */}
      <div className="d-flex align-items-center justify-content-between pb-3 mb-2 border-bottom border-border">
        <div className="d-flex align-items-center gap-2">
          <Filter size={16} className="text-primary" />
          <h3 className="fw-bold text-text text-uppercase small mb-0" style={{ letterSpacing: '0.06em' }}>
            Filtros
          </h3>
        </div>
        {hasFilters && (
          <button
            onClick={clear}
            className="d-flex align-items-center gap-1 text-primary bg-transparent border-0 p-0 fw-semibold"
            style={{ fontSize: '0.75rem' }}
          >
            <X size={13} />
            Limpiar todo
          </button>
        )}
      </div>

      {/* Buscador de Palabras Clave (Multi-coincidencia) */}
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="position-relative">
          <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar (ej. poleron oversize)..."
            className="form-control form-control-sm bg-elevated text-text border-border ps-5"
            style={{ fontSize: '0.8rem', borderRadius: '6px' }}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); set('q', ''); }}
              className="btn btn-sm p-0 position-absolute text-muted border-0 bg-transparent"
              style={{ right: '8px', top: '6px' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      {/* Colección / Líneas Existentes */}
      {config.showLinea && (
        <Section title="Colección / Línea">
          <div className="d-flex flex-column gap-2">
            {lineasOpciones.map((item) => (
              <label
                key={item.key}
                className="d-flex align-items-center gap-2 small text-muted user-select-none cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="linea"
                  checked={linea === item.key}
                  onChange={() => set('linea', item.key)}
                  className="form-check-input mt-0"
                />
                <span className={linea === item.key ? 'text-primary fw-bold' : 'text-text'}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Categorías Multi-selección */}
      {config.showCategoria && config.categorias && config.categorias.length > 0 && (
        <Section title="Categorías">
          <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {config.categorias.map((cat) => {
              const isChecked = categorias.includes(cat);
              return (
                <label
                  key={cat}
                  className="d-flex align-items-center gap-2 small text-muted user-select-none cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle('categoria', cat)}
                    className="form-check-input mt-0"
                  />
                  <span className={isChecked ? 'text-primary fw-bold' : 'text-text'}>
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>
      )}

      {/* Tallas con Stock > 0 */}
      {config.showTalla && tallasOpciones.length > 0 && (
        <Section title="Tallas en Stock">
          <div className="d-flex flex-wrap gap-1">
            {tallasOpciones.map((t) => {
              const isSelected = tallas.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle('talla', t)}
                  className={`btn btn-sm ${
                    isSelected ? 'btn-primary text-black fw-bold' : 'btn-outline-secondary'
                  }`}
                  style={{ minWidth: '2.4rem', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Colores con Stock > 0 */}
      {config.showColor && config.colores && config.colores.length > 0 && (
        <Section title="Colores Disponibles">
          <div className="d-flex flex-wrap gap-2">
            {config.colores.map((c) => {
              const isSelected = colores.includes(c.nombre);
              return (
                <button
                  key={c.nombre}
                  type="button"
                  onClick={() => toggle('color', c.nombre)}
                  className={`rounded-circle border position-relative p-0 transition-all ${
                    isSelected ? 'border-primary border-2 shadow' : 'border-secondary'
                  }`}
                  style={{
                    width: '1.6rem',
                    height: '1.6rem',
                    backgroundColor: c.hex,
                    transform: isSelected ? 'scale(1.15)' : 'none',
                  }}
                  title={c.nombre}
                >
                  {isSelected && (
                    <span
                      className="position-absolute top-50 start-50 translate-middle"
                      style={{
                        color: c.hex.toLowerCase() === '#ffffff' ? '#111' : '#fff',
                        fontSize: '0.65rem',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Materiales (Drinkware) */}
      {config.showMaterial && config.materiales && config.materiales.length > 0 && (
        <Section title="Materiales">
          <div className="d-flex flex-column gap-2">
            {config.materiales.map((m) => {
              const isChecked = materiales.includes(m);
              return (
                <label
                  key={m}
                  className="d-flex align-items-center gap-2 small text-muted user-select-none cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle('material', m)}
                    className="form-check-input mt-0"
                  />
                  <span className={isChecked ? 'text-primary fw-bold' : 'text-text'}>
                    {m}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>
      )}

      {/* Rango de Precio */}
      {config.showPrecio && (
        <Section title="Precio Máximo">
          <div className="d-flex flex-column gap-2">
            <input
              type="range"
              min={5000}
              max={config.maxPrecio ?? 80000}
              step={1000}
              value={precioMax}
              onChange={(e) => set('precio_max', e.target.value)}
              className="form-range"
            />
            <div className="d-flex justify-content-between small text-muted">
              <span>$5.000</span>
              <span className="text-primary fw-bold">Hasta ${precioMax.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </Section>
      )}

      {/* Filtros Especiales */}
      <Section title="Estado & Ofertas">
        <div className="d-flex flex-column gap-2">
          {[
            { key: 'destacado', label: '★ Solo Destacados', checked: soloDestacados },
            { key: 'nuevo', label: '✨ Novedades & Recientes', checked: soloNuevos },
            { key: 'oferta', label: '🔥 En Oferta Especial', checked: soloOferta },
          ].map((item) => (
            <label
              key={item.key}
              className="d-flex align-items-center gap-2 small text-muted user-select-none cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggle(item.key, '1')}
                className="form-check-input mt-0"
              />
              <span className={item.checked ? 'text-primary fw-bold' : 'text-text'}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
}
