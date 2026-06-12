import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/Logo_RCEstampa.png" alt="RC Estampa" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-italiana text-2xl text-text">RC Estampa</span>
            </div>
            <p className="font-montserrat text-sm text-muted leading-relaxed mb-6">
              Estampado premium en ropa y drinkware. Diseños únicos que cuentan tu historia.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a
                href="https://wa.me/56944830378"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-montserrat font-600 text-sm uppercase tracking-wider text-muted mb-6">
              Navegación
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/catalogo', label: 'Catálogo Ropa' },
                { to: '/drinkware', label: 'Drinkware' },
                { to: '/disenar', label: 'Diseña el tuyo' },
                { to: '/personalizado', label: 'Pedido Personalizado' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-montserrat text-sm text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-600 text-sm uppercase tracking-wider text-muted mb-6">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/56944830378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat text-sm text-muted hover:text-text transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={14} />
                  +56 9 4483 0378
                </a>
              </li>
              <li>
                <p className="font-montserrat text-sm text-muted">
                  Lunes a Viernes: 9:00 — 18:00
                </p>
              </li>
              <li>
                <p className="font-montserrat text-sm text-muted">
                  Sábado: 10:00 — 14:00
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-montserrat text-xs text-ghost">
            © 2025 RC Estampa. Todos los derechos reservados.
          </p>
          <p className="font-montserrat text-xs text-ghost">
            Desarrollado por Mateo Araneda Medina
          </p>
        </div>
      </div>
    </footer>
  );
}
