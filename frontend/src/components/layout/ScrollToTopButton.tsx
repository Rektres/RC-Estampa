import { useState, useEffect } from 'react';
import { ChevronUp, X } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (isClosed || !visible) return null;

  return (
    <div
      className="position-fixed d-flex align-items-center gap-2"
      style={{ bottom: '1.5rem', left: '1.5rem', zIndex: 1040 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="position-relative">
        {/* Botón 'X' para eliminar/ocultar temporalmente (igual que WhatsApp) */}
        {hovered && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsClosed(true);
            }}
            className="btn btn-sm p-0 rounded-circle position-absolute d-flex align-items-center justify-content-center border border-border"
            style={{
              top: '-6px',
              left: '-6px',
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              color: '#FFFFFF',
              zIndex: 1042,
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
            title="Cerrar botón"
            aria-label="Cerrar botón de subir"
          >
            <X size={12} />
          </button>
        )}

        {/* Botón principal de Scroll to Top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="btn d-flex align-items-center justify-content-center rounded-circle p-0 transition-all hover-lift bg-card border border-primary-30"
          style={{
            width: '3.25rem',
            height: '3.25rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            color: 'var(--brand-primary)',
          }}
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          <ChevronUp size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tooltip al posar el cursor */}
      {hovered && (
        <span
          className="bg-elevated border border-border font-montserrat text-text px-3 py-2 rounded-3 shadow text-nowrap animate-fadeIn d-none d-sm-inline-block"
          style={{ fontSize: '0.825rem' }}
        >
          Volver arriba
        </span>
      )}
    </div>
  );
}
