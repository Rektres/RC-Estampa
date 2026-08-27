import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <div
      className="position-fixed d-flex align-items-center gap-2"
      style={{ bottom: '1.5rem', right: '1.5rem', zIndex: 1040 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <span
          className="bg-elevated border border-border font-montserrat text-text px-3 py-2 rounded-3 shadow text-nowrap animate-fadeIn"
          style={{ fontSize: '0.825rem' }}
        >
          ¿Dudas con tu pedido o diseño?
        </span>
      )}

      <div className="position-relative">
        {/* Botón 'X' de cierre visible SOLO al posar el cursor */}
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
              right: '-6px',
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              color: '#FFFFFF',
              zIndex: 1042,
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
            title="Cerrar temporalmente"
            aria-label="Cerrar botón de WhatsApp"
          >
            <X size={12} />
          </button>
        )}

        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center justify-content-center text-decoration-none rounded-circle transition-all hover-lift"
          style={{
            width: '3.5rem',
            height: '3.5rem',
            backgroundColor: 'var(--brand-primary)',
            boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
          }}
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={26} className="text-dark" />
        </a>
      </div>
    </div>
  );
}
