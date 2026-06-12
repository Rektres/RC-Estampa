import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://wa.me/56944830378"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Contactar por WhatsApp"
    >
      {hovered && (
        <span className="bg-elevated border border-border font-montserrat text-sm text-text px-3 py-2 rounded-sm shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
          ¿Dudas con tu pedido?
        </span>
      )}
      <div className="bg-primary rounded-full p-3.5 shadow-xl shadow-primary/20 hover:bg-primary-dark transition-colors duration-200">
        <MessageCircle size={24} className="text-black" />
      </div>
    </a>
  );
}
