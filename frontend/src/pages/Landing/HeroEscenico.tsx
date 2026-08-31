import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { getLinaLabel } from '../../utils';

// Fallback por si la base de datos está cargando
const SAMPLE_CARDS = [
  {
    id: 991,
    nombre: 'Polera Oversize Premium',
    linea: 'urbana',
    slug: 'polera-oversize-premium',
    tipoItem: 'ropa',
    materialText: 'Algodón 240g · DTF Ultra HD',
    imagen: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 992,
    nombre: 'Botella Térmica 750ml Matte',
    linea: 'drinkware',
    slug: 'botella-termica-750ml',
    tipoItem: 'drinkware',
    materialText: 'Acero Inox 304 · Grabado Láser HD',
    imagen: 'https://images.pexels.com/photos/4000090/pexels-photo-4000090.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 993,
    nombre: 'Hoodie Felpa Pesada 350g',
    linea: 'formal',
    slug: 'hoodie-felpa-pesada',
    tipoItem: 'ropa',
    materialText: 'Felpa Francesa · Bordado & DTF',
    imagen: 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function HeroEscenico() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: prodsRopa } = useAsync(() => catalogoApi.productosAll(), []);
  const { data: prodsDrink } = useAsync(() => catalogoApi.drinkwareAll(), []);

  // Productos con configuración "destacado" (mostrar en portada)
  const stackCards = useMemo(() => {
    const destacadosRopa = (prodsRopa ?? [])
      .filter((p) => p.destacado)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        linea: p.linea || 'urbana',
        slug: p.slug,
        tipoItem: 'ropa' as const,
        materialText: 'Algodón 240g · DTF Textil Ultra HD',
        imagen: p.imagenes?.[0]?.imagen || 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
      }));

    const destacadosDrink = (prodsDrink ?? [])
      .filter((d) => d.destacado)
      .map((d) => ({
        id: d.id,
        nombre: d.nombre,
        linea: d.linea || 'drinkware',
        slug: d.slug,
        tipoItem: 'drinkware' as const,
        materialText: d.material ? `${d.material} · Grabado Láser` : 'Acero Inox 304 · Grabado Láser',
        imagen: d.imagenes?.[0]?.imagen || 'https://images.pexels.com/photos/4000090/pexels-photo-4000090.jpeg?auto=compress&cs=tinysrgb&w=800',
      }));

    const combined = [...destacadosRopa, ...destacadosDrink];
    return combined.length > 0 ? combined : SAMPLE_CARDS;
  }, [prodsRopa, prodsDrink]);

  const totalCards = stackCards.length;

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  return (
    <section className="position-relative overflow-hidden pt-4 pb-5">
      {/* Subtle background ambient light */}
      <div
        className="position-absolute top-0 start-50 translate-middle-x pointer-events-none"
        style={{
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(201, 168, 76, 0.12) 0%, rgba(7, 8, 20, 0) 70%)',
          zIndex: 0,
        }}
      />

      <div className="container-xxl position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center g-5">
          {/* Columna Izquierda: Copywriting, Eyebrow & CTAs */}
          <div className="col-12 col-lg-7">
            {/* Eyebrow Luxury Badge */}
            <div className="mb-3">
              <div className="eyebrow-badge">
                <span className="glyph">★</span>
                <span>TALLER DE GRABADO LÁSER & ESTAMPADO TEXTIL</span>
              </div>
            </div>

            {/* Titular Monumental */}
            <h1 className="hero-giant-title mb-4">
              ESTAMPA TU VISIÓN <br />
              <span className="stroke-text">CON MÁXIMA DURABILIDAD</span> <br />
              <span className="gold-gradient-text">& EXCELENCIA TEXTIL.</span>
            </h1>

            {/* Párrafo */}
            <p className="font-montserrat text-muted mb-4 lead" style={{ maxWidth: '38rem', fontSize: '1rem', lineHeight: '1.75' }}>
              Elevamos cada prenda y accesorio mediante técnicas de estampado de alta definición, serigrafía de precisión y sublimación premium. Desarrollamos piezas singulares formuladas para perdurar en el tiempo y destacar con máxima distinción visual en cualquier escenario o acontecimiento.
            </p>

            {/* Doble Botón CTA */}
            <div className="d-flex flex-wrap align-items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/disenar')}
                className="btn btn-primary px-4 py-3 d-flex align-items-center gap-2 rounded-3 hover-lift shadow-lg"
                style={{ fontSize: '0.9rem' }}
              >
                <Sparkles size={18} />
                <span>Diseñar en Canvas en Vivo</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate('/catalogo')}
                className="btn btn-secondary px-4 py-3 d-flex align-items-center gap-2 rounded-3 hover-lift"
                style={{ fontSize: '0.9rem' }}
              >
                <span>Explorar Colecciones</span>
              </button>
            </div>

            {/* Micro Trust Pills */}
            <div className="d-flex flex-wrap align-items-center gap-4 mt-4 pt-3 border-top border-border">
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="font-montserrat small text-muted" style={{ fontSize: '0.78rem' }}>
                  Garantía de Fijación y Lavado
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Layers size={16} className="text-primary" />
                <span className="font-montserrat small text-muted" style={{ fontSize: '0.78rem' }}>
                  DTF Textil & Drinkware Sublimado
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Cover Flow 3D de Productos Destacados */}
          <div className="col-12 col-lg-5">
            <div className="position-relative cover-flow-wrapper" style={{ minHeight: '540px', paddingTop: '15px' }}>
              {/* Halo de iluminación exterior */}
              <div
                className="position-absolute top-50 start-50 translate-middle pointer-events-none"
                style={{
                  width: '120%',
                  height: '120%',
                  background: 'radial-gradient(circle, rgba(201, 168, 76, 0.22) 0%, transparent 70%)',
                  filter: 'blur(45px)',
                  zIndex: 0,
                }}
              />

              {/* Barra superior de Cover Flow: Solo flechas de navegación */}
              <div className="d-flex align-items-center justify-content-end mb-3 px-2 position-relative" style={{ zIndex: 35 }}>
                {/* Botones de Navegación 3D (Flechas) */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={prevCard}
                    className="btn btn-sm btn-outline-secondary p-0 rounded-circle d-flex align-items-center justify-content-center hover-lift"
                    style={{ width: '34px', height: '34px', backgroundColor: 'var(--surface-card)' }}
                    title="Anterior"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextCard}
                    className="btn btn-sm btn-outline-primary p-0 rounded-circle d-flex align-items-center justify-content-center hover-lift"
                    style={{ width: '34px', height: '34px', backgroundColor: 'var(--surface-card)' }}
                    title="Siguiente"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Escenario 3D Cover Flow */}
              <div
                className="position-relative w-100 d-flex justify-content-center align-items-center"
                style={{
                  height: '470px',
                  perspective: '1100px',
                  perspectiveOrigin: '50% 50%',
                  transformStyle: 'preserve-3d',
                  touchAction: 'pan-y',
                }}
              >
                {stackCards.map((card, idx) => {
                  let diff = idx - activeIndex;
                  if (diff > totalCards / 2) diff -= totalCards;
                  if (diff < -totalCards / 2) diff += totalCards;

                  // Mostrar solo las 5 tarjetas visibles más cercanas
                  const isVisible = Math.abs(diff) <= 2;
                  if (!isVisible) return null;

                  const isCenter = diff === 0;
                  const isLeft = diff < 0;
                  const isRight = diff > 0;

                  let transformStyle = '';
                  const zIndex = 30 - Math.abs(diff) * 5;
                  const opacity = 1; // Tarjetas 100% sólidas sin traslucidez
                  let filter = 'none';

                  if (isCenter) {
                    transformStyle = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
                    filter = 'none';
                  } else if (isLeft) {
                    const offsetPx = Math.abs(diff) === 1 ? -120 : -210;
                    const zOffset = Math.abs(diff) === 1 ? -120 : -220;
                    transformStyle = `translateX(${offsetPx}px) translateZ(${zOffset}px) rotateY(38deg) scale(${1 - Math.abs(diff) * 0.12})`;
                    filter = Math.abs(diff) === 1 ? 'brightness(0.65)' : 'brightness(0.35) blur(0.8px)';
                  } else if (isRight) {
                    const offsetPx = diff === 1 ? 120 : 210;
                    const zOffset = diff === 1 ? -120 : -220;
                    transformStyle = `translateX(${offsetPx}px) translateZ(${zOffset}px) rotateY(-38deg) scale(${1 - diff * 0.12})`;
                    filter = diff === 1 ? 'brightness(0.65)' : 'brightness(0.35) blur(0.8px)';
                  }

                  return (
                    <div
                      key={card.id}
                      onClick={() => !isCenter && setActiveIndex(idx)}
                      className="hero-preview-card p-3 shadow-2xl position-absolute top-0 w-100"
                      style={{
                        maxWidth: '410px',
                        transform: transformStyle,
                        zIndex,
                        opacity,
                        filter,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease, filter 0.45s ease',
                        cursor: isCenter ? 'default' : 'pointer',
                        pointerEvents: 'auto',
                        boxShadow: isCenter
                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 25px rgba(201, 168, 76, 0.25)'
                          : '0 15px 30px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Header with Live Indicator */}
                      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="live-dot" />
                          <span className="font-montserrat fw-semibold text-text text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                            Producción Activa en RC Estampa
                          </span>
                        </div>
                        <span className="badge bg-primary-10 text-primary border border-primary-30 font-montserrat" style={{ fontSize: '0.65rem' }}>
                          Edición 2026
                        </span>
                      </div>

                      {/* Hero Feature Image */}
                      <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ height: '300px' }}>
                        <img
                          src={card.imagen}
                          alt={card.nombre}
                          className="w-100 h-100 object-fit-cover stage-card-img"
                        />
                        <div className="position-absolute bottom-0 start-0 end-0 p-3 stage-card-overlay">
                          <div className="eyebrow-badge mb-1" style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                            LÍNEA {getLinaLabel(card.linea).toUpperCase()} PREMIUM
                          </div>
                          <h3 className="font-italiana text-text fs-4 mb-0 text-truncate">{card.nombre}</h3>
                        </div>
                      </div>

                      {/* Card footer details & direct link */}
                      <div className="d-flex align-items-center justify-content-between pt-1 px-1">
                        <div>
                          <span className="font-montserrat text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            Acabado & Soporte
                          </span>
                          <span className="font-montserrat fw-semibold text-text small text-truncate d-block" style={{ maxWidth: '180px' }}>
                            {card.materialText}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${card.tipoItem === 'drinkware' ? '/drinkware' : '/catalogo'}/${card.slug}`);
                          }}
                          className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 font-montserrat fw-semibold"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <span>Ver Detalle</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Indicadores de Paginación Cover Flow */}
              <div className="d-flex justify-content-center align-items-center gap-2 mt-4 position-relative" style={{ zIndex: 35 }}>
                {stackCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="p-0 border-0 rounded-circle transition-all"
                    style={{
                      width: i === activeIndex ? '22px' : '7px',
                      height: '7px',
                      borderRadius: '999px',
                      backgroundColor: i === activeIndex ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                    }}
                    title={`Prenda ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}