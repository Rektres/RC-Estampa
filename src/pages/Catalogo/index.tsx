import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../../components/shared/FilterSidebar';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { productos } from '../../data/mockData';

const CATEGORIAS = ['Poleras', 'Hoodies', 'Camisas', 'Polos', 'Chaquetas', 'Pantalones'];
const COLORES = [
  { nombre: 'Negro', hex: '#111111' },
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Gris', hex: '#888888' },
  { nombre: 'Azul marino', hex: '#1B2A4A' },
  { nombre: 'Beige', hex: '#D4C5A9' },
];

const ORDENES = [
  { value: '-creado_en', label: 'Más reciente' },
  { value: 'precio', label: 'Precio ↑' },
  { value: '-precio', label: 'Precio ↓' },
  { value: 'destacado', label: 'Destacados' },
];

const PER_PAGE = 12;

export default function Catalogo() {
  const [params] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);

  const orden = params.get('ordering') ?? '-creado_en';
  const linea = params.get('linea') ?? '';
  const tallas = params.get('talla')?.split(',').filter(Boolean) ?? [];
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? 100000);
  const q = params.get('q') ?? '';

  const filtered = useMemo(() => {
    let list = [...productos];
    if (linea) list = list.filter((p) => p.linea === linea);
    if (categorias.length) list = list.filter((p) => categorias.includes(p.categoria.nombre));
    if (tallas.length) list = list.filter((p) => p.variantes.some((v) => tallas.includes(v.talla) && v.stock > 0));
    if (colores.length) list = list.filter((p) => p.variantes.some((v) => colores.includes(v.color)));
    if (precioMax < 100000) list = list.filter((p) => (p.precio_oferta ?? p.precio) <= precioMax);
    if (q) list = list.filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase()));

    if (orden === 'precio') list.sort((a, b) => a.precio - b.precio);
    else if (orden === '-precio') list.sort((a, b) => b.precio - a.precio);
    else if (orden === 'destacado') list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    else list.sort((a, b) => b.id - a.id);

    return list;
  }, [linea, tallas, categorias, colores, precioMax, q, orden]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filterConfig = {
    showLinea: true,
    showCategoria: true,
    categorias: CATEGORIAS,
    showTalla: true,
    showColor: true,
    colores: COLORES,
    showPrecio: true,
    maxPrecio: 60000,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 font-montserrat text-xs text-muted mb-3">
          <a href="/" className="hover:text-text">Inicio</a>
          <span>/</span>
          <span className="text-text">Catálogo</span>
        </div>
        <h1 className="font-italiana text-5xl text-text mb-2">Catálogo</h1>
        {q && (
          <p className="font-montserrat text-sm text-muted">
            Resultados para "<span className="text-text">{q}</span>"
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar config={filterConfig} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
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
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 border border-border text-muted font-montserrat text-sm px-3 py-2 rounded-sm hover:border-muted hover:text-text transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filtros
              </button>
            </div>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-montserrat text-muted">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((p) => (
                <HoverSwapCard key={p.id} producto={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}
                  className={`w-9 h-9 rounded-sm font-montserrat text-sm font-600 border transition-colors ${
                    page === i + 1
                      ? 'bg-primary text-black border-primary'
                      : 'border-border text-muted hover:border-muted hover:text-text'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
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
