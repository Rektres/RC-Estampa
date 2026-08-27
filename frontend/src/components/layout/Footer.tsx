import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Compass, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-top border-border position-relative" style={{ marginTop: '7rem' }}>
      {/* Dynamic top gradient line */}
      <div
        className="position-absolute top-0 start-0 end-0"
        style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, var(--brand-primary) 50%, transparent 100%)' }}
      />

      <div className="container-xxl" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div className="row g-5">
          {/* Columna 1: Brand & Manifesto */}
          <div className="col-12 col-lg-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src="/Logo_RCEstampa.png"
                alt="RC Estampa"
                className="rounded-circle object-fit-cover border border-primary-30"
                style={{ width: '2.75rem', height: '2.75rem' }}
              />
              <div>
                <span className="font-italiana fs-3 text-text d-block lh-1">RC Estampa</span>
                <span className="font-montserrat text-muted text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                  Grabados & Estampados
                </span>
              </div>
            </div>
            <p className="font-montserrat small text-muted lh-base mb-4" style={{ maxWidth: '28rem' }}>
              Alta estampería textil y drinkware con los más altos estándares de calidad. Fusión de técnicas contemporáneas y acabados duraderos para marcas, eventos y creadores.
            </p>
            <div className="d-flex gap-3">
              <a
                href="#"
                className="p-2 rounded-circle bg-elevated border border-border text-muted text-decoration-none hover-lift"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href="#"
                className="p-2 rounded-circle bg-elevated border border-border text-muted text-decoration-none hover-lift"
                aria-label="Facebook"
              >
                <Facebook size={17} />
              </a>
              <a
                href="https://wa.me/56944830378"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-circle bg-elevated border border-border text-primary text-decoration-none hover-lift"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          {/* Columna 2: Mapa del Sitio */}
          <div className="col-12 col-sm-6 col-lg-3">
            <h4
              className="font-montserrat fw-semibold small text-uppercase text-primary mb-4 d-flex align-items-center gap-2"
              style={{ letterSpacing: '0.08em' }}
            >
              <Compass size={15} /> Mapa del Sitio
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/catalogo', label: 'Catálogo Textil' },
                { to: '/drinkware', label: 'Línea Drinkware & Vasos' },
                { to: '/disenar', label: 'Editor Canvas en Vivo' },
                { to: '/personalizado', label: 'Cotizaciones Empresa' },
                { to: '/perfil', label: 'Mi Cuenta & Pedidos' },
                { to: '/terminos-y-privacidad', label: 'Términos & Privacidad' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-montserrat small text-muted text-decoration-none d-inline-block hover-lift"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto & Horarios */}
          <div className="col-12 col-sm-6 col-lg-4">
            <h4
              className="font-montserrat fw-semibold small text-uppercase text-primary mb-4 d-flex align-items-center gap-2"
              style={{ letterSpacing: '0.08em' }}
            >
              <Clock size={14} /> Atención Directa & Despacho
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0 font-montserrat small text-muted">
              <li>
                <a
                  href="https://wa.me/56944830378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text text-decoration-none d-flex align-items-center gap-2 hover-lift"
                >
                  <MessageCircle size={16} className="text-primary" />
                  +56 9 4483 0378 (WhatsApp Directo)
                </a>
              </li>
              <li className="d-flex align-items-start gap-2">
                <Clock size={16} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <div>Lun a Vie: 9:00 — 18:00 hrs</div>
                  <div className="text-ghost">Sáb: 10:00 — 14:00 hrs</div>
                </div>
              </li>
              <li className="d-flex align-items-start gap-2">
                <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="text-text fw-semibold">Venta 100% Online</div>
                  <div className="text-ghost">Despachos a todo Chile a domicilio</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div
          className="border-top border-border pt-4 mt-5 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3"
        >
          <p className="font-montserrat text-ghost mb-0 text-center text-sm-start" style={{ fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} RC Estampa SpA. Todos los derechos reservados.
          </p>
          <Link
            to="/terminos-y-privacidad"
            className="font-montserrat text-muted small text-decoration-none hover-lift"
            style={{ fontSize: '0.75rem' }}
          >
            Términos & Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
