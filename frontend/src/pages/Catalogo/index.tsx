import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../../components/shared/FilterSidebar';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';

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
  const { data: productosData } = useAsync(() => catalogoApi.productosAll(), []);

  const orden = params.get('ordering') ?? '-creado_en';
  const linea = params.get('linea') ?? '';
  const tallas = params.get('talla')?.split(',').filter(Boolean) ?? [];
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? 100000);
  const q = params.get('q') ?? '';

  const filtered = useMemo(() => {
    let list = [...(productosData ?? [])];
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
  }, [productosData, linea, tallas, categorias, colores, precioMax, q, orden]);

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
    <div className="container py-5">
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-3" style={{ fontSize: '0.75rem' }}>
          <a href="/" className="text-muted text-decoration-none">Inicio</a>
          <span>/</span>
          <span className="text-text">Catálogo</span>
        </div>
        <div className="eyebrow-badge mb-2">
          <span className="glyph">★</span>
          <span>COLECCIÓN TEXTIL</span>
        </div>
        <h1 className="font-italiana text-text mb-2" style={{ fontSize: '3rem' }}>Catálogo de Ropa</h1>
        <p className="font-montserrat small text-muted mb-0">
          Prendas confeccionadas en algodón peinado y mezclas premium con terminaciones en DTF y serigrafía.
        </p>
        {q && (
          <p className="font-montserrat small text-primary mt-2 mb-0">
            Resultados para "<span className="text-text">{q}</span>"
          </p>
        )}
      </div>

      <div className="d-flex" style={{ gap: '2rem' }}>
        {/* Sidebar desktop */}
        <aside className="d-none d-md-block flex-shrink-0" style={{ width: '16rem' }}>
          <FilterSidebar config={filterConfig} />
        </aside>

        {/* Main content */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {/* Toolbar */}
          <div className="d-flex align-items-center justify-content-between mb-4 gap-3">
            <p className="font-montserrat small text-muted mb-0">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="d-flex align-items-center gap-2">
              <select
                value={orden}
                onChange={(e) => {
                  const u = new URLSearchParams(params);
                  u.set('ordering', e.target.value);
                  window.history.replaceState({}, '', `?${u.toString()}`);
                }}
                className="form-select form-select-sm w-auto font-montserrat bg-elevated"
              >
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSidebarOpen(true)}
                className="d-inline-flex d-md-none align-items-center gap-2 border border-border text-muted font-montserrat px-3 py-2 rounded bg-transparent"
                style={{ fontSize: '0.875rem' }}
              >
                <SlidersHorizontal size={14} />
                Filtros
              </button>
            </div>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="text-center" style={{ padding: '5rem 0' }}>
              <p className="font-montserrat text-muted mb-0">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-lg-3 g-4">
              {paginated.map((p) => (
                <div key={p.id} className="col">
                  <HoverSwapCard producto={p} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}
                  className={`rounded font-montserrat fw-semibold border d-inline-flex align-items-center justify-content-center ${
                    page === i + 1
                      ? 'bg-primary text-black border-primary'
                      : 'border-border text-muted bg-transparent'
                  }`}
                  style={{ width: '2.25rem', height: '2.25rem', fontSize: '0.875rem' }}
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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex" style={{ zIndex: 1050 }}>
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
          <aside className="position-relative bg-card h-100 overflow-y-auto p-4 border-end border-border" style={{ zIndex: 10, width: '20rem' }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="font-montserrat fw-semibold text-text mb-0">Filtros</h3>
              <button onClick={() => setSidebarOpen(false)} className="bg-transparent border-0 p-0"><X size={20} className="text-muted" /></button>
            </div>
            <FilterSidebar config={filterConfig} />
          </aside>
        </div>
      )}
    </div>
  );
}
