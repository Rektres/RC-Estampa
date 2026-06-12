import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../../components/shared/FilterSidebar';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { productosVajilla } from '../../data/mockData';

const CATEGORIAS_VAJ = ['Tazas', 'Termos', 'Vasos', 'Jarras', 'Botellas'];
const MATERIALES = ['Cerámica', 'Acero inoxidable', 'Vidrio', 'Aluminio'];
const COLORES_VAJ = [
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Negro', hex: '#111111' },
  { nombre: 'Plata', hex: '#C0C0C0' },
  { nombre: 'Transparente', hex: '#E8F4F8' },
];

const ORDENES = [
  { value: '-creado_en', label: 'Más reciente' },
  { value: 'precio', label: 'Precio ↑' },
  { value: '-precio', label: 'Precio ↓' },
  { value: 'destacado', label: 'Destacados' },
];

export default function Drinkware() {
  const [params] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const orden = params.get('ordering') ?? '-creado_en';
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const materiales = params.get('material')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? 50000);

  const filtered = useMemo(() => {
    let list = [...productosVajilla];
    if (categorias.length) list = list.filter((p) => categorias.includes(p.categoria.nombre));
    if (materiales.length) list = list.filter((p) => materiales.includes(p.material));
    if (colores.length) list = list.filter((p) => p.variantes.some((v) => colores.includes(v.color)));
    if (precioMax < 50000) list = list.filter((p) => (p.precio_oferta ?? p.precio) <= precioMax);

    if (orden === 'precio') list.sort((a, b) => a.precio - b.precio);
    else if (orden === '-precio') list.sort((a, b) => b.precio - a.precio);
    else if (orden === 'destacado') list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [categorias, materiales, colores, precioMax, orden]);

  const filterConfig = {
    showCategoria: true,
    categorias: CATEGORIAS_VAJ,
    showColor: true,
    colores: COLORES_VAJ,
    showMaterial: true,
    materiales: MATERIALES,
    showPrecio: true,
    maxPrecio: 50000,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 font-montserrat text-xs text-muted mb-3">
          <a href="/" className="hover:text-text">Inicio</a>
          <span>/</span>
          <span className="text-text">Drinkware</span>
        </div>
        <h1 className="font-italiana text-5xl text-text mb-1">Drinkware</h1>
        <p className="font-montserrat text-sm text-muted">Estampado en cada sorbo</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar config={filterConfig} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            <p className="font-montserrat text-sm text-muted">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={orden}
                onChange={(e) => {
                  const u = new URLSearchParams(params);
                  u.set('ordering', e.target.value);
                  window.history.replaceState({}, '', `?${u.toString()}`);
                }}
                className="bg-elevated border border-border text-text font-montserrat text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-primary"
              >
                {ORDENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 border border-border text-muted font-montserrat text-sm px-3 py-2 rounded-sm"
              >
                <SlidersHorizontal size={14} />
                Filtros
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => <HoverSwapCard key={p.id} producto={p} prefixPath="/drinkware" />)}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-80 bg-card h-full overflow-y-auto p-6 border-r border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-montserrat font-600 text-text">Filtros</h3>
              <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-muted" /></button>
            </div>
            <FilterSidebar config={filterConfig} />
          </aside>
        </div>
      )}
    </div>
  );
}
