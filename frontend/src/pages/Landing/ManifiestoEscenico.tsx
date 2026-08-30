import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManifiestoEscenico() {
  return (
    <section className="container-xxl py-5 my-4 position-relative">
      <div className="luxury-box p-4 p-md-5 position-relative overflow-hidden">
        {/* Holographic Orb (Component G in PDF) */}
        <div
          className="orb-holographic top-0 end-0 translate-middle-y"
          style={{ right: '-50px', top: '20%' }}
        />

        <div className="row align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
          {/* Lateral index (RC / 01) */}
          <div className="col-12 col-md-3 border-end-md border-border pe-md-4">
            <div className="d-flex flex-column gap-2">
              <span
                className="font-montserrat fw-bold text-primary"
                style={{ fontSize: '0.85rem', letterSpacing: '0.2em' }}
              >
                RC / 01
              </span>
              <span
                className="font-montserrat text-muted text-uppercase"
                style={{ fontSize: '0.68rem', letterSpacing: '0.14em' }}
              >
                MANIFIESTO DE MARCA
              </span>
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: 'var(--brand-primary)',
                  marginTop: '0.5rem',
                }}
              />
            </div>
          </div>

          {/* Editorial Text Block */}
          <div className="col-12 col-md-9 ps-md-4">
            <div className="eyebrow-badge mb-3">
              <span className="glyph">★</span>
              <span>CALIDAD & ESTAMPADO INTEGRAL</span>
            </div>

            <h2 className="font-italiana text-text fs-1 mb-4 lh-sm">
              Estampado y personalización premium en textil, drinkware y artículos de colección.
            </h2>

            <p className="font-montserrat text-muted lead mb-4" style={{ fontSize: '0.98rem', lineHeight: '1.8' }}>
              En RC Estampa transformamos poleras, polerones, camisas, botellas térmicas, vasos y tazas en piezas únicas de alta fidelidad. Utilizamos tecnología DTF Textil Ultra HD con tintas ecológicas certificadas y grabado láser de ultra precisión, garantizando colores vibrantes, máxima resistencia a más de 50 lavados y acabados profesionales para marcas, empresas y creadores.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-4 pt-2">
              <Link
                to="/disenar"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 hover-lift"
              >
                <Sparkles size={16} />
                <span>Diseñar en el Editor Digital</span>
                <ArrowRight size={15} />
              </Link>
              <span className="font-montserrat text-ghost small" style={{ fontSize: '0.78rem' }}>
                Estampado en Chile con estándar internacional
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
