import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../../components/shared/FilterSidebar';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';

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
  const { data: vajillaData } = useAsync(() => catalogoApi.drinkwareAll(), []);

  const orden = params.get('ordering') ?? '-creado_en';
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const materiales = params.get('material')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? 50000);

  useSEO({
    title: 'Drinkware & Botellas Térmicas Personalizadas',
    description: 'Catálogo de drinkware premium en Chile: botellas térmicas en acero inoxidable 304, mugs de cerámica, vasos templados y jarras grabadas a fuego.',
    keywords: 'termos personalizados chile, tazas estampadas santiago, botellas termicas acero, vasos grabados eventos, merchandising drinkware',
  });

  const filtered = useMemo(() => {
    let list = [...(vajillaData ?? [])];
    if (categorias.length) list = list.filter((p) => categorias.includes(p.categoria.nombre));
    if (materiales.length) list = list.filter((p) => materiales.includes(p.material));
    if (colores.length) list = list.filter((p) => p.variantes.some((v) => colores.includes(v.color)));
    if (precioMax < 50000) list = list.filter((p) => (p.precio_oferta ?? p.precio) <= precioMax);

    if (orden === 'precio') list.sort((a, b) => a.precio - b.precio);
    else if (orden === '-precio') list.sort((a, b) => b.precio - a.precio);
    else if (orden === 'destacado') list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [vajillaData, categorias, materiales, colores, precioMax, orden]);

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
    <div className="container py-5">
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-3" style={{ fontSize: '0.75rem' }}>
          <a href="/" className="text-muted text-decoration-none">Inicio</a>
          <span>/</span>
          <span className="text-text">Drinkware</span>
        </div>
        <div className="eyebrow-badge mb-2">
          <span className="glyph">★</span>
          <span>DRINKWARE & VAJILLA TÉRMICA</span>
        </div>
        <h1 className="font-italiana text-text mb-1" style={{ fontSize: '3rem' }}>Drinkware RC Estampa</h1>
        <p className="font-montserrat small text-muted mb-0">Botellas térmicas, mugs y vasos con grabado térmico de alta adherencia.</p>
      </div>

      <div className="d-flex" style={{ gap: '2rem' }}>
        <aside className="d-none d-md-block flex-shrink-0" style={{ width: '16rem' }}>
          <FilterSidebar config={filterConfig} />
        </aside>

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
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
                {ORDENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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

          <div className="row row-cols-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filtered.map((p) => (
              <div key={p.id} className="col">
                <HoverSwapCard producto={p} prefixPath="/drinkware" />
              </div>
            ))}
          </div>
        </div>
      </div>

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
