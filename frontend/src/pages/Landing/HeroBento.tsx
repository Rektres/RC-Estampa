import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Star } from 'lucide-react';
import LineaBadge from '../../components/shared/LineaBadge';

export default function HeroBento() {
  const navigate = useNavigate();

  return (
    <section className="container-xxl pt-5 pb-4">
      <div
        className="d-grid gap-3"
        style={{
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
        }}
      >
        {/* Block 1 — large, spans 2 rows on left */}
        <div
          className="position-relative overflow-hidden border border-border"
          style={{ gridRow: '1 / 3', minHeight: '480px', borderRadius: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/catalogo')}
        >
          <img
            src="https://images.pexels.com/photos/4210846/pexels-photo-4210846.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Ropa urbana RC Estampa"
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          />
          {/* Hover overlay dorado 8% */}
          <div className="position-absolute top-0 start-0 w-100 h-100" />
          {/* Bottom overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
          />
          <div
            className="position-absolute d-flex align-items-center gap-2"
            style={{ bottom: '1.25rem', left: '1.25rem' }}
          >
            <LineaBadge linea="urbana" />
            <span className="font-montserrat fw-medium small text-text">Catálogo Ropa</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        {/* Block 2 — drinkware, top right */}
        <div
          className="position-relative overflow-hidden border border-border"
          onClick={() => navigate('/drinkware')}
          style={{ minHeight: '220px', borderRadius: '20px', cursor: 'pointer' }}
        >
          <img
            src="https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Drinkware estampado"
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          />
          <div className="position-absolute top-0 start-0 w-100 h-100" />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
          />
          <div
            className="position-absolute d-flex align-items-center gap-2"
            style={{ bottom: '1rem', left: '1rem' }}
          >
            <LineaBadge linea="drinkware" />
            <span className="font-montserrat fw-medium small text-text">Drinkware</span>
            <ArrowRight size={16} className="text-drinkware" />
          </div>
        </div>

        {/* Block 3 + 4 — two small blocks */}
        <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {/* Block 3 — tintas ecológicas */}
          <div
            className="bg-elevated border border-border d-flex flex-column align-items-center justify-content-center p-4 gap-2"
            style={{ borderRadius: '20px' }}
          >
            <div
              className="rounded-circle bg-drinkware-20 d-flex align-items-center justify-content-center"
              style={{ width: '3rem', height: '3rem' }}
            >
              <Leaf size={22} className="text-drinkware" />
            </div>
            <p className="font-montserrat fw-semibold small text-text text-center lh-sm">
              Tintas ecológicas
            </p>
            <p className="font-montserrat text-muted text-center" style={{ fontSize: '0.75rem' }}>
              100% seguras para uso cotidiano
            </p>
          </div>

          {/* Block 4 — review */}
          <div
            className="bg-card border border-border d-flex flex-column justify-content-between"
            style={{ borderRadius: '20px', padding: '1.25rem' }}
          >
            <div className="d-flex" style={{ gap: '0.125rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-primary" style={{ fill: 'currentColor' }} />
              ))}
            </div>
            <div>
              <p className="font-italiana text-text fst-italic lh-sm mb-2">
                "El estampado quedó perfecto. Increíble calidad."
              </p>
              <p className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>— Valentina R.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
