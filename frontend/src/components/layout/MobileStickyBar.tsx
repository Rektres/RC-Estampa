import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';

export default function MobileStickyBar() {
  const location = useLocation();

  // Ocultar la barra en el editor interactivo de canvas para no estorbar los controles
  if (location.pathname.startsWith('/disenar/')) {
    return null;
  }

  return (
    <div
      className="d-md-none position-fixed bottom-0 start-0 end-0 py-2 px-3 border-top border-border"
      style={{
        zIndex: 1025,
        backgroundColor: 'var(--surface-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="d-flex align-items-center justify-content-around gap-2">
        <Link
          to="/disenar"
          className="btn btn-primary btn-sm flex-fill py-2 d-flex align-items-center justify-content-center gap-1 font-montserrat fw-semibold rounded-3 text-decoration-none shadow-sm"
          style={{ fontSize: '0.78rem' }}
        >
          <Sparkles size={14} />
          <span>Diseñar Prenda</span>
        </Link>

        <Link
          to="/catalogo"
          className="btn btn-secondary btn-sm flex-fill py-2 d-flex align-items-center justify-content-center gap-1 font-montserrat fw-semibold rounded-3 text-decoration-none"
          style={{ fontSize: '0.78rem' }}
        >
          <ShoppingBag size={14} />
          <span>Catálogo</span>
        </Link>

        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm p-2 rounded-3 d-flex align-items-center justify-content-center text-decoration-none"
          aria-label="WhatsApp"
          title="WhatsApp Asesor"
        >
          <MessageCircle size={16} />
        </a>
      </div>
    </div>
  );
}
