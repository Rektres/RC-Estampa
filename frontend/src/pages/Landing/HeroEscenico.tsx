import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Layers } from 'lucide-react';

export default function HeroEscenico() {
  const navigate = useNavigate();

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

            {/* Párrafo Justificado (Regla Maestra) */}
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

          {/* Columna Derecha: Tarjeta Flotante con Live Dot */}
          <div className="col-12 col-lg-5">
            <div className="position-relative">
              {/* Outer decorative halo */}
              <div
                className="position-absolute top-50 start-50 translate-middle pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(201, 168, 76, 0.15) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  zIndex: 0,
                }}
              />

              {/* Floating Preview Card */}
              <div
                className="hero-preview-card p-3 shadow-2xl position-relative hover-lift"
                style={{
                  zIndex: 2,
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
                <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ height: '340px' }}>
                  <img
                    src="https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Polera Oversize Premium"
                    className="w-100 h-100 object-fit-cover stage-card-img"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3 stage-card-overlay"
                  >
                    <div className="eyebrow-badge mb-1" style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                      LÍNEA URBANA PREMIUM
                    </div>
                    <h3 className="font-italiana text-text fs-4 mb-0">Polera Oversize Premium</h3>
                  </div>
                </div>

                {/* Card footer details & direct link */}
                <div className="d-flex align-items-center justify-content-between pt-1 px-1">
                  <div>
                    <span className="font-montserrat text-muted d-block" style={{ fontSize: '0.7rem' }}>
                      Acabado Textil
                    </span>
                    <span className="font-montserrat fw-semibold text-text small">
                      Algodón 240g · DTF Ultra HD
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/catalogo')}
                    className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 font-montserrat fw-semibold"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <span>Ver Detalle</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}