import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-top border-border" style={{ marginTop: '6rem' }}>
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="row g-5">
          {/* Brand */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src="/Logo_RCEstampa.png"
                alt="RC Estampa"
                className="rounded-circle object-fit-cover"
                style={{ width: '2.5rem', height: '2.5rem' }}
              />
              <span className="font-italiana fs-3 text-text">RC Estampa</span>
            </div>
            <p className="font-montserrat small text-muted lh-lg mb-4">
              Estampado premium en ropa y drinkware. Diseños únicos que cuentan tu historia.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted text-decoration-none" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted text-decoration-none" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted text-decoration-none" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a
                href="https://wa.me/56944830378"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted text-decoration-none"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="col-12 col-md-4">
            <h4
              className="font-montserrat fw-semibold small text-uppercase text-muted mb-4"
              style={{ letterSpacing: '0.05em' }}
            >
              Navegación
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2">
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
                    className="font-montserrat small text-muted text-decoration-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-4">
            <h4
              className="font-montserrat fw-semibold small text-uppercase text-muted mb-4"
              style={{ letterSpacing: '0.05em' }}
            >
              Contacto
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li>
                <a
                  href="https://wa.me/56944830378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat small text-muted text-decoration-none d-flex align-items-center gap-2"
                >
                  <MessageCircle size={14} />
                  +56 9 4483 0378
                </a>
              </li>
              <li>
                <p className="font-montserrat small text-muted">
                  Lunes a Viernes: 9:00 — 18:00
                </p>
              </li>
              <li>
                <p className="font-montserrat small text-muted">
                  Sábado: 10:00 — 14:00
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top border-border pt-5 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3" style={{ marginTop: '3rem' }}>
          <p className="font-montserrat text-ghost" style={{ fontSize: '0.75rem' }}>
            © 2025 RC Estampa. Todos los derechos reservados.
          </p>
          <p className="font-montserrat text-ghost" style={{ fontSize: '0.75rem' }}>
            Desarrollado por Mateo Araneda Medina
          </p>
        </div>
      </div>
    </footer>
  );
}
