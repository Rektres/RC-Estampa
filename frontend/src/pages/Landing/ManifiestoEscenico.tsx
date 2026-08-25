import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManifiestoEscenico() {
  return (
    <section className="container-xxl py-5 my-4 position-relative">
      <div
        className="bg-card border border-border rounded-4 p-4 p-md-5 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 16, 38, 0.95) 0%, rgba(22, 24, 54, 0.85) 100%)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
        }}
      >
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
              <span>FILOSOFÍA DEL ATELIER</span>
            </div>

            <h2 className="font-italiana text-white fs-1 mb-4 lh-sm">
              La estampería como lenguaje de identidad, arte y presencia escénica.
            </h2>

            <p className="font-montserrat text-muted lead mb-4" style={{ fontSize: '0.98rem', lineHeight: '1.8' }}>
              En RC Estampa no concebimos la prenda como un simple lienzo inerte, sino como un manifiesto visual en movimiento. Cada gota de tinta pigmentada, cada emulsión y cada curado térmico responden a la exigencia de creadores, bandas, empresas y personas que entienden que vestir o portar una pieza es proyectar carácter y autenticidad sin concesiones.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-4 pt-2">
              <Link
                to="/disenar"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 hover-lift"
              >
                <Sparkles size={16} />
                <span>Crear Pieza en el Atelier</span>
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
