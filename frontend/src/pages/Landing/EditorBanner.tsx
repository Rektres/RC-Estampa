import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function EditorBanner() {
  return (
    <section
      className="bg-elevated border-top border-bottom border-border px-3"
      style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
    >
      <div className="mx-auto text-center" style={{ maxWidth: '48rem' }}>
        <div className="d-flex justify-content-center mb-4">
          <div
            className="rounded-circle bg-primary-20 d-flex align-items-center justify-content-center"
            style={{ width: '3.5rem', height: '3.5rem' }}
          >
            <Sparkles size={26} className="text-primary" />
          </div>
        </div>
        <h2
          className="font-italiana text-text mb-3 lh-sm"
          style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)' }}
        >
          ¿Tienes un diseño en mente?
          <br />
          <span className="text-primary">Estámpalo en lo que quieras.</span>
        </h2>
        <p
          className="font-montserrat text-muted mx-auto"
          style={{ maxWidth: '32rem', marginBottom: '2rem' }}
        >
          Poleras, gorras, tazas, termos — tú eliges el producto y el diseño.
          Nuestro editor te permite crear desde cero en minutos.
        </p>
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3">
          <Link to="/disenar" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
            Abrir editor
          </Link>
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center gap-2 font-montserrat small text-muted text-decoration-none"
          >
            <MessageCircle size={16} />
            ¿Prefieres que lo hagamos nosotros?
          </a>
        </div>
      </div>
    </section>
  );
}
