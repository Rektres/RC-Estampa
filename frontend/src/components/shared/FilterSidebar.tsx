import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface FilterConfig {
  showLinea?: boolean;
  showCategoria?: boolean;
  categorias?: string[];
  showTalla?: boolean;
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
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
      {open && <div>{children}</div>}
    </div>
  );
}

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function FilterSidebar({ config }: Props) {
  const [params, setParams] = useSearchParams();

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
    if (value) updated.set(key, value); else updated.delete(key);
    setParams(updated);
  }

  function clear() {
    setParams(new URLSearchParams());
  }

  const hasFilters = params.toString() !== '';
  const linea = params.get('linea') ?? '';
  const tallas = params.get('talla')?.split(',').filter(Boolean) ?? [];
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const materiales = params.get('material')?.split(',').filter(Boolean) ?? [];
  const precioMin = Number(params.get('precio_min') ?? 0);
  const precioMax = Number(params.get('precio_max') ?? config.maxPrecio ?? 100000);

  return (
    <aside className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="font-montserrat fw-semibold text-muted text-uppercase small" style={{ letterSpacing: '0.05em' }}>Filtros</h3>
        {hasFilters && (
          <button
            onClick={clear}
            className="d-flex align-items-center gap-1 font-montserrat text-primary bg-transparent border-0 p-0"
            style={{ fontSize: '0.75rem' }}
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      {config.showLinea && (
        <Section title="Línea">
          {(['urbana', 'formal'] as const).map((l) => (
            <label key={l} className="d-flex align-items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="linea"
                checked={linea === l}
                onChange={() => set('linea', linea === l ? '' : l)}
                className="form-check-input flex-shrink-0 mt-0"
              />
              <span className="font-montserrat small text-muted text-capitalize">
                {l === 'urbana' ? 'Urbana' : 'Formal'}
              </span>
            </label>
          ))}
        </Section>
      )}

      {config.showCategoria && config.categorias && config.categorias.length > 0 && (
        <Section title="Categoría">
          {config.categorias.map((cat) => (
            <label key={cat} className="d-flex align-items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={categorias.includes(cat)}
                onChange={() => toggle('categoria', cat)}
                className="form-check-input flex-shrink-0 mt-0"
              />
              <span className="font-montserrat small text-muted">
                {cat}
              </span>
            </label>
          ))}
        </Section>
      )}

      {config.showTalla && (
        <Section title="Talla">
          <div className="d-flex flex-wrap gap-2">
            {TALLAS.map((t) => (
              <button
                key={t}
                onClick={() => toggle('talla', t)}
                className={`rounded border font-montserrat fw-semibold ${
                  tallas.includes(t)
                    ? 'border-primary bg-primary-10 text-primary'
                    : 'border-border text-muted bg-transparent'
                }`}
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>
      )}

      {config.showColor && config.colores && (
        <Section title="Color">
          <div className="d-flex flex-wrap gap-2">
            {config.colores.map((c) => (
              <button
                key={c.hex}
                onClick={() => toggle('color', c.nombre)}
                title={c.nombre}
                className={`rounded-circle border border-2 p-0 ${
                  params.get('color')?.split(',').includes(c.nombre)
                    ? 'border-primary'
                    : 'border-border'
                }`}
                style={{ backgroundColor: c.hex, width: '1.75rem', height: '1.75rem', transform: params.get('color')?.split(',').includes(c.nombre) ? 'scale(1.1)' : undefined }}
              />
            ))}
          </div>
        </Section>
      )}

      {config.showMaterial && config.materiales && (
        <Section title="Material">
          {config.materiales.map((m) => (
            <label key={m} className="d-flex align-items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={materiales.includes(m)}
                onChange={() => toggle('material', m)}
                className="form-check-input flex-shrink-0 mt-0"
              />
              <span className="font-montserrat small text-muted">{m}</span>
            </label>
          ))}
        </Section>
      )}

      {config.showPrecio && (
        <Section title="Precio">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
              <span>${precioMin.toLocaleString('es-CL')}</span>
              <span>${precioMax.toLocaleString('es-CL')}</span>
            </div>
            <input
              type="range"
              min={0}
              max={config.maxPrecio ?? 100000}
              step={1000}
              value={precioMax}
              onChange={(e) => set('precio_max', e.target.value)}
              className="form-range"
            />
            <p className="font-montserrat text-muted text-center" style={{ fontSize: '0.75rem' }}>
              Hasta ${precioMax.toLocaleString('es-CL')}
            </p>
          </div>
        </Section>
      )}
    </aside>
  );
}
