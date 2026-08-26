import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check, Shield } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('rc_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('rc_cookie_consent', 'accepted_essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3 p-md-4"
      style={{ zIndex: 1050 }}
    >
      <div
        className="container bg-elevated border border-border rounded-4 p-4 shadow-lg text-text"
        style={{
          maxWidth: '56rem',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(18, 18, 20, 0.95)',
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="p-2 rounded-3 bg-primary-20 text-primary flex-shrink-0 mt-1"
              style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Cookie size={22} />
            </div>
            <div>
              <h4 className="font-montserrat fw-bold text-text fs-6 mb-1 d-flex align-items-center gap-2">
                Uso de Cookies y Privacidad
                <Shield size={14} className="text-primary" />
              </h4>
              <p className="font-montserrat text-muted small mb-0 lh-sm">
                Utilizamos cookies propias y de terceros para optimizar tu experiencia de compra, gestionar el carrito y personalizar el taller de diseño según nuestra{' '}
                <Link to="/terminos-y-privacidad" className="text-primary text-decoration-underline">
                  Política de Privacidad
                </Link>.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 w-100 w-md-auto flex-wrap flex-sm-nowrap justify-content-end">
            <button
              onClick={handleAcceptEssential}
              className="btn btn-outline-secondary btn-sm font-montserrat fw-semibold px-3 py-2 flex-grow-1 flex-sm-grow-0"
              style={{ fontSize: '0.8rem' }}
            >
              Solo Necesarias
            </button>
            <button
              onClick={handleAcceptAll}
              className="btn btn-primary btn-sm font-montserrat fw-bold px-3 py-2 flex-grow-1 flex-sm-grow-0 d-flex align-items-center justify-content-center gap-1"
              style={{ fontSize: '0.8rem' }}
            >
              <Check size={14} /> Aceptar Todo
            </button>
            <button
              onClick={handleAcceptEssential}
              className="btn btn-link text-muted p-1 ms-1 d-none d-md-block"
              title="Cerrar"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
