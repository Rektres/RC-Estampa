import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://wa.me/56944830378"
      target="_blank"
      rel="noopener noreferrer"
      className="position-fixed d-flex align-items-center gap-3 text-decoration-none"
      style={{ bottom: '1.5rem', right: '1.5rem', zIndex: 1040 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Contactar por WhatsApp"
    >
      {hovered && (
        <span
          className="bg-elevated border border-border font-montserrat text-text px-3 py-2 rounded shadow text-nowrap"
          style={{ fontSize: '0.875rem' }}
        >
          ¿Dudas con tu pedido?
        </span>
      )}
      <div
        className="bg-primary rounded-circle p-3 d-flex align-items-center justify-content-center"
        style={{ boxShadow: '0 8px 24px rgba(201,168,76,0.25)' }}
      >
        <MessageCircle size={24} className="text-dark" />
      </div>
    </a>
  );
}
