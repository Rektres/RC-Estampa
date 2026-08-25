import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ShieldCheck, Shirt, Thermometer } from 'lucide-react';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import type { Producto, ProductoVajilla } from '../../types';

type Filtro = 'todos' | 'urbana' | 'formal' | 'drinkware';

const filtros: { key: Filtro; label: string }[] = [
  { key: 'todos', label: 'Todos los Destacados' },
  { key: 'urbana', label: 'Línea Urbana (Streetwear)' },
  { key: 'formal', label: 'Línea Formal & Luxury' },
  { key: 'drinkware', label: 'Drinkware & Accesorios' },
];

export default function Destacados() {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [specProduct, setSpecProduct] = useState<Producto | ProductoVajilla | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: prod } = useAsync(() => catalogoApi.productosAll(), []);
  const { data: vaj } = useAsync(() => catalogoApi.drinkwareAll(), []);

  const allDestacados: (Producto | ProductoVajilla)[] = [
    ...(prod ?? []).filter((p) => p.destacado),
    ...(vaj ?? []).filter((p) => p.destacado),
  ];

  const filtered = allDestacados.filter((p) => {
    if (filtro === 'todos') return true;
    return p.linea === filtro;
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add('visible')),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="container-xxl py-5 my-3" id="coleccion">
      <div ref={sectionRef} className="fade-in">
        {/* Header & Filter Chips */}
        <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-4 mb-5">
          <div>
            <div className="eyebrow-badge mb-2">
              <span className="glyph">★</span>
              <span>CATÁLOGO TÉCNICO ESCÉNICO</span>
            </div>
            <h2 className="font-italiana fs-1 text-text mb-1">Colección Destacada</h2>
            <p className="font-montserrat small text-muted mb-0">
              Selección curada de prendas y drinkware con terminaciones de alta precisión.
            </p>
          </div>

          {/* Filter Chips Dinámicos */}
          <div className="d-flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`filter-chip ${filtro === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Cards Grid */}
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
          {filtered.slice(0, 8).map((p) => (
            <div className="col" key={p.id}>
              <HoverSwapCard producto={p} onOpenSpecs={(item) => setSpecProduct(item)} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Especificaciones Técnicas (Componente F de la Guía) */}
      {specProduct && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3 modal-backdrop-escenico"
          style={{
            zIndex: 1070,
          }}
          onClick={() => setSpecProduct(null)}
        >
          <div
            className="bg-card border border-primary-30 rounded-4 p-4 p-md-5 shadow-2xl position-relative"
            style={{ maxWidth: '36rem', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSpecProduct(null)}
              className="btn btn-link p-0 position-absolute top-0 end-0 m-4 text-muted hover-lift"
              aria-label="Cerrar modal"
            >
              <X size={22} />
            </button>

            <div className="eyebrow-badge mb-3">
              <span className="glyph">★</span>
              <span>FICHA TÉCNICA DE PRODUCCIÓN</span>
            </div>

            <h3 className="font-italiana fs-3 text-text mb-2">{specProduct.nombre}</h3>
            <p className="font-montserrat small text-primary fw-bold mb-4">
              Precio: {formatPrice(specProduct.precio_oferta ?? specProduct.precio)}
            </p>

            <div className="d-flex flex-column gap-3 font-montserrat small text-muted mb-4">
              <div className="d-flex align-items-start gap-3 p-3 rounded-3 bg-elevated border border-border">
                <Shirt size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <span className="fw-bold text-text d-block mb-1">Composición & Soporte:</span>
                  <span>
                    {specProduct.linea === 'drinkware'
                      ? 'Acero inoxidable grado alimenticio 304 con recubrimiento térmico sublimable.'
                      : '100% Algodón peinado de alto gramaje (220-240g/m²). Tratamiento pre-encogido.'}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3 bg-elevated border border-border">
                <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <span className="fw-bold text-text d-block mb-1">Técnica de Estampado:</span>
                  <span>
                    DTF Textil Ultra HD con tintas pigmentadas ecológicas o Sublimación a 200°C para penetración molecular permanente.
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3 bg-elevated border border-border">
                <Thermometer size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <span className="fw-bold text-text d-block mb-1">Instrucciones de Cuidado:</span>
                  <span>
                    Lavar con agua fría del revés. No aplicar calor directo con plancha sobre el estampado. Secado a sombra.
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-border">
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Garantía 100% RC Estampa</span>
              </div>
              <button
                onClick={() => setSpecProduct(null)}
                className="btn btn-primary btn-sm px-4 py-2"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

