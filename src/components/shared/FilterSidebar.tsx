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
    <div className="border-b border-border py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full font-montserrat font-600 text-sm text-text uppercase tracking-wider mb-3"
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
    <aside className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-montserrat font-600 text-sm text-muted uppercase tracking-wider">Filtros</h3>
        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs font-montserrat text-primary hover:text-primary-dark transition-colors"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      {config.showLinea && (
        <Section title="Línea">
          {(['urbana', 'formal'] as const).map((l) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer mb-2 group">
              <input
                type="radio"
                name="linea"
                checked={linea === l}
                onChange={() => set('linea', linea === l ? '' : l)}
                className="accent-primary"
              />
              <span className="font-montserrat text-sm text-muted group-hover:text-text transition-colors capitalize">
                {l === 'urbana' ? 'Urbana' : 'Formal'}
              </span>
            </label>
          ))}
        </Section>
      )}

      {config.showCategoria && config.categorias && config.categorias.length > 0 && (
        <Section title="Categoría">
          {config.categorias.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer mb-2 group">
              <input
                type="checkbox"
                checked={categorias.includes(cat)}
                onChange={() => toggle('categoria', cat)}
                className="accent-primary"
              />
              <span className="font-montserrat text-sm text-muted group-hover:text-text transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </Section>
      )}

      {config.showTalla && (
        <Section title="Talla">
          <div className="flex flex-wrap gap-2">
            {TALLAS.map((t) => (
              <button
                key={t}
                onClick={() => toggle('talla', t)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-montserrat font-600 transition-colors ${
                  tallas.includes(t)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted hover:border-muted hover:text-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>
      )}

      {config.showColor && config.colores && (
        <Section title="Color">
          <div className="flex flex-wrap gap-2">
            {config.colores.map((c) => (
              <button
                key={c.hex}
                onClick={() => toggle('color', c.nombre)}
                title={c.nombre}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  params.get('color')?.split(',').includes(c.nombre)
                    ? 'border-primary scale-110'
                    : 'border-border hover:border-muted'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </Section>
      )}

      {config.showMaterial && config.materiales && (
        <Section title="Material">
          {config.materiales.map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer mb-2 group">
              <input
                type="checkbox"
                checked={materiales.includes(m)}
                onChange={() => toggle('material', m)}
                className="accent-primary"
              />
              <span className="font-montserrat text-sm text-muted group-hover:text-text transition-colors">{m}</span>
            </label>
          ))}
        </Section>
      )}

      {config.showPrecio && (
        <Section title="Precio">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-montserrat text-muted">
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
              className="w-full"
            />
            <p className="font-montserrat text-xs text-muted text-center">
              Hasta ${precioMax.toLocaleString('es-CL')}
            </p>
          </div>
        </Section>
      )}
    </aside>
  );
}
