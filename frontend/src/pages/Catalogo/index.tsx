import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ShoppingBag, Sparkles, Layers } from 'lucide-react';
import FilterSidebar from '../../components/shared/FilterSidebar';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';
import type { Producto, ProductoVajilla } from '../../types';

const PER_PAGE = 12;

const ORDENES = [
  { value: '-creado_en', label: 'Más reciente' },
  { value: 'precio', label: 'Precio: Menor a Mayor' },
  { value: '-precio', label: 'Precio: Mayor a Menor' },
  { value: 'nombre', label: 'Nombre (A-Z)' },
  { value: 'destacado', label: 'Destacados' },
];

const COLORES = [
  { nombre: 'Negro', hex: '#111111' },
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Gris', hex: '#888888' },
  { nombre: 'Azul marino', hex: '#1B2A4A' },
  { nombre: 'Beige', hex: '#D4C5A9' },
  { nombre: 'Plata', hex: '#C0C0C0' },
  { nombre: 'Transparente', hex: '#E8F4F8' },
];

const MATERIALES = ['Algodón peinado', 'Poliéster', 'Cerámica', 'Acero inoxidable 304', 'Vidrio', 'Aluminio'];

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Cargar productos de ropa, drinkware y categorías
  const { data: productosRopa, loading: loadingRopa } = useAsync(() => catalogoApi.productosAll(), []);
  const { data: productosDrinkware, loading: loadingDrink } = useAsync(() => catalogoApi.drinkwareAll(), []);
  const { data: categoriasData } = useAsync(() => catalogoApi.categorias(), []);

  const loading = loadingRopa || loadingDrink;

  // Parámetros de URL
  const orden = params.get('ordering') ?? '-creado_en';
  const linea = params.get('linea') ?? '';
  const tallas = params.get('talla')?.split(',').filter(Boolean) ?? [];
  const categorias = params.get('categoria')?.split(',').filter(Boolean) ?? [];
  const colores = params.get('color')?.split(',').filter(Boolean) ?? [];
  const materiales = params.get('material')?.split(',').filter(Boolean) ?? [];
  const precioMax = Number(params.get('precio_max') ?? 100000);
  const soloDestacados = params.get('destacado') === '1';
  const soloNuevos = params.get('nuevo') === '1';
  const soloOferta = params.get('oferta') === '1';
  const q = params.get('q') ?? '';

  useSEO({
    title: linea === 'drinkware'
      ? 'Catálogo Drinkware & Botellas Térmicas | RC Estampa'
      : linea === 'urbana' || linea === 'formal' || linea === 'ropa'
      ? 'Catálogo Ropa Textil & Personalizados | RC Estampa'
      : 'Catálogo General — Ropa & Drinkware Grabado | RC Estampa',
    description: 'Catálogo unificado de poleras, polerones, camisas, botellas térmicas y mugs grabados con técnica DTF Textil y láser en Chile.',
    keywords: 'catalogo rc estampa, poleras dtf, drinkware grabado santiago, ropa personalizada chile',
  });

  // Lista unificada de categorías dinámicas
  const listaCategorias = useMemo(() => {
    if (categoriasData && Array.isArray(categoriasData) && categoriasData.length > 0) {
      return categoriasData.map((c) => c.nombre);
    }
    return ['Poleras', 'Hoodies', 'Camisas', 'Polos', 'Chaquetas', 'Tazas', 'Termos', 'Vasos', 'Botellas'];
  }, [categoriasData]);

  // Lista unificada y filtrado multi-coincidencia
  const filtered = useMemo(() => {
    const listRopa = (Array.isArray(productosRopa) ? productosRopa : []).map((p) => ({ ...p, tipoItem: 'ropa' as const }));
    const listDrink = (Array.isArray(productosDrinkware) ? productosDrinkware : []).map((d) => ({ ...d, tipoItem: 'drinkware' as const }));
    let list: any[] = [...listRopa, ...listDrink];

    // 1. Filtro por Línea / Colección
    if (linea) {
      if (linea === 'ropa') {
        list = list.filter((item) => item.tipoItem === 'ropa');
      } else if (linea === 'drinkware') {
        list = list.filter((item) => item.tipoItem === 'drinkware');
      } else {
        list = list.filter((item) => item.linea === linea);
      }
    }

    // 2. Filtro Multi-Categorías
    if (categorias.length > 0) {
      list = list.filter((item) => categorias.includes(item.categoria?.nombre));
    }

    // 3. Filtro Tallas (Ropa)
    if (tallas.length > 0) {
      list = list.filter((item) =>
        item.variantes?.some((v: any) => tallas.includes(v.talla) && v.stock > 0)
      );
    }

    // 4. Filtro Colores
    if (colores.length > 0) {
      list = list.filter((item) =>
        item.variantes?.some((v: any) => colores.includes(v.color))
      );
    }

    // 5. Filtro Materiales (Drinkware)
    if (materiales.length > 0) {
      list = list.filter((item) => item.material && materiales.includes(item.material));
    }

    // 6. Filtro Precio Máximo
    if (precioMax < 100000) {
      list = list.filter((item) => (item.precio_oferta ?? item.precio) <= precioMax);
    }

    // 7. Filtros Especiales
    if (soloDestacados) list = list.filter((item) => item.destacado);
    if (soloNuevos) list = list.filter((item) => item.nuevo);
    if (soloOferta) list = list.filter((item) => item.precio_oferta && item.precio_oferta < item.precio);

    // 8. Búsqueda por Palabras Clave (Multi-coincidencia / Multi-word matching)
    if (q.trim()) {
      const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list.filter((item) => {
        const fullSearchableText = `${item.nombre} ${item.descripcion || ''} ${item.categoria?.nombre || ''} ${item.linea || ''} ${item.material || ''}`.toLowerCase();
        // Coincidencia: el texto contiene todas las palabras ingresadas
        return words.every((word) => fullSearchableText.includes(word));
      });
    }

    // 9. Ordenamiento
    if (orden === 'precio') list.sort((a, b) => a.precio - b.precio);
    else if (orden === '-precio') list.sort((a, b) => b.precio - a.precio);
    else if (orden === 'nombre') list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (orden === 'destacado') list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    else list.sort((a, b) => (b.id || 0) - (a.id || 0));

    return list;
  }, [productosRopa, productosDrinkware, linea, categorias, tallas, colores, materiales, precioMax, soloDestacados, soloNuevos, soloOferta, q, orden]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filterConfig = {
    showLinea: true,
    showCategoria: true,
    categorias: listaCategorias,
    showTalla: linea !== 'drinkware',
    showColor: true,
    colores: COLORES,
    showMaterial: linea === 'drinkware' || !linea,
    materiales: MATERIALES,
    showPrecio: true,
    maxPrecio: 80000,
  };

  function setOrder(val: string) {
    const u = new URLSearchParams(params);
    u.set('ordering', val);
    setParams(u);
  }

  function removeFilter(key: string, value?: string) {
    const u = new URLSearchParams(params);
    if (!value) {
      u.delete(key);
    } else {
      const current = u.get(key)?.split(',').filter(Boolean) ?? [];
      const next = current.filter((v) => v !== value);
      if (next.length === 0) u.delete(key);
      else u.set(key, next.join(','));
    }
    setParams(u);
  }

  return (
    <div className="container py-5 animate-tab-fade">
      {/* Header del Catálogo */}
      <div className="mb-4 pb-3 border-bottom border-border">
        <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-2" style={{ fontSize: '0.75rem' }}>
          <Link to="/" className="text-muted text-decoration-none">Inicio</Link>
          <span>/</span>
          <span className="text-text">Catálogo General</span>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-elevated border border-border mb-2">
              <Sparkles size={13} className="text-primary" />
              <span className="font-montserrat small text-primary fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                {linea === 'drinkware' ? 'COLECCIÓN DRINKWARE' : linea === 'ropa' ? 'COLECCIÓN TEXTIL' : 'CATÁLOGO OFICIAL RC ESTAMPA'}
              </span>
            </div>
            <h1 className="font-italiana text-text mb-1 fs-2">
              {linea === 'drinkware' ? 'Drinkware & Grabados' : linea === 'ropa' ? 'Ropa & Confección Textil' : 'Catálogo de Ropa & Drinkware'}
            </h1>
            <p className="font-montserrat small text-muted mb-0">
              Personalización de alta gama con tecnología DTF Textil Ultra HD y grabado láser de máxima definición.
            </p>
          </div>

          {/* Selector de Colección Rápido */}
          <div className="btn-group bg-elevated rounded-3 p-1 border border-border font-montserrat align-self-start align-self-md-center">
            {[
              { key: '', label: 'Todo' },
              { key: 'ropa', label: 'Ropa Textil' },
              { key: 'drinkware', label: 'Drinkware' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  const u = new URLSearchParams(params);
                  if (tab.key) u.set('linea', tab.key);
                  else u.delete('linea');
                  setParams(u);
                  setPage(1);
                }}
                className={`btn btn-sm border-0 ${
                  (linea === tab.key || (!linea && tab.key === '')) ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal con Sidebar a la Izquierda */}
      <div className="row g-4">
        {/* Sidebar Lateral Izquierdo (Desktop) */}
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <div className="p-4 rounded-4 bg-card border border-border shadow-sm position-sticky" style={{ top: '6rem' }}>
            <FilterSidebar config={filterConfig} />
          </div>
        </div>

        {/* Botón Filtros para Mobile */}
        <div className="col-12 d-lg-none">
          <button
            onClick={() => setSidebarMobileOpen(true)}
            className="btn btn-outline-secondary w-100 font-montserrat d-flex align-items-center justify-content-center gap-2 py-2"
          >
            <SlidersHorizontal size={16} />
            <span>Filtrar y Ordenar Productos ({filtered.length})</span>
          </button>
        </div>

        {/* Modal / Drawer de Filtros Mobile */}
        {sidebarMobileOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1080, backdropFilter: 'blur(6px)' }}
            onClick={() => setSidebarMobileOpen(false)}
          >
            <div
              className="bg-card border border-border rounded-4 p-4 shadow-lg w-100 animate-tab-fade"
              style={{ maxWidth: '26rem', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-border">
                <h4 className="font-montserrat fw-bold text-text fs-5 mb-0">Filtros de Catálogo</h4>
                <button
                  onClick={() => setSidebarMobileOpen(false)}
                  className="btn btn-sm btn-outline-secondary p-1 rounded-circle"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar config={filterConfig} />
              <button
                onClick={() => setSidebarMobileOpen(false)}
                className="btn btn-primary w-100 mt-4 font-montserrat fw-bold py-2"
              >
                Aplicar Filtros ({filtered.length} productos)
              </button>
            </div>
          </div>
        )}

        {/* Grid de Productos a la Derecha */}
        <div className="col-12 col-lg-9">
          {/* Barra Superior de Ordenamiento y Tags de Filtro */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 bg-card border border-border mb-4 font-montserrat">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-muted">
                Mostrando <strong>{filtered.length}</strong> {filtered.length === 1 ? 'producto' : 'productos'}
              </span>

              {/* Tags de Filtros Activos */}
              {q && (
                <span className="badge bg-elevated text-primary border border-border d-inline-flex align-items-center gap-1">
                  Búsqueda: "{q}"
                  <button onClick={() => removeFilter('q')} className="border-0 bg-transparent p-0 text-primary ms-1">
                    <X size={11} />
                  </button>
                </span>
              )}
              {categorias.map((c) => (
                <span key={c} className="badge bg-elevated text-text border border-border d-inline-flex align-items-center gap-1">
                  {c}
                  <button onClick={() => removeFilter('categoria', c)} className="border-0 bg-transparent p-0 text-muted ms-1">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            {/* Selector de Orden */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small text-nowrap">Ordenar por:</span>
              <select
                value={orden}
                onChange={(e) => setOrder(e.target.value)}
                className="form-select form-select-sm bg-elevated text-text border-border font-montserrat w-auto"
                style={{ fontSize: '0.8rem' }}
              >
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Cards de Productos */}
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="col-12 col-sm-6 col-xl-4">
                  <div className="p-3 rounded-4 bg-card border border-border shadow-sm">
                    <div className="skeleton-shimmer mb-3" style={{ width: '100%', height: '240px' }} />
                    <div className="skeleton-shimmer mb-2" style={{ width: '80%', height: '20px' }} />
                    <div className="skeleton-shimmer" style={{ width: '40%', height: '18px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-5 text-center bg-card border border-border rounded-4 font-montserrat shadow-sm">
              <ShoppingBag size={48} className="text-muted mb-3 mx-auto" />
              <h3 className="fs-5 text-text fw-bold mb-2">No se encontraron productos</h3>
              <p className="text-muted small mb-4">
                No hay coincidencias con los filtros aplicados. Intenta ampliar tu búsqueda o limpiar filtros.
              </p>
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="btn btn-primary font-montserrat fw-semibold px-4 py-2"
              >
                Limpiar Todos los Filtros
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {paginated.map((item: any) => (
                <div key={`${item.tipoItem}-${item.id}`} className="col-12 col-sm-6 col-xl-4">
                  <HoverSwapCard producto={item} />
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5 font-montserrat">
              <button
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 150, behavior: 'smooth' }); }}
                disabled={page <= 1}
                className="btn btn-sm btn-outline-secondary px-3 py-2"
              >
                Anterior
              </button>
              <span className="text-muted small px-2">
                Página <strong>{page}</strong> de {totalPages}
              </span>
              <button
                onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 150, behavior: 'smooth' }); }}
                disabled={page >= totalPages}
                className="btn btn-sm btn-outline-secondary px-3 py-2"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
