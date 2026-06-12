import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function EditorBanner() {
  return (
    <section className="bg-elevated border-y border-border py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles size={26} className="text-primary" />
          </div>
        </div>
        <h2 className="font-italiana text-4xl md:text-5xl text-text mb-4 leading-snug">
          ¿Tienes un diseño en mente?
          <br />
          <span className="text-primary">Estámpalo en lo que quieras.</span>
        </h2>
        <p className="font-montserrat text-muted text-base mb-8 max-w-lg mx-auto">
          Poleras, gorras, tazas, termos — tú eliges el producto y el diseño.
          Nuestro editor te permite crear desde cero en minutos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/disenar" className="btn-primary px-8 py-3 text-sm">
            Abrir editor
          </Link>
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-montserrat text-sm text-muted hover:text-text transition-colors"
          >
            <MessageCircle size={16} />
            ¿Prefieres que lo hagamos nosotros?
          </a>
        </div>
      </div>
    </section>
  );
}
