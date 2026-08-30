import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Check, Shield, ChevronDown, ChevronUp, Info, CheckCircle2, Lock } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 800);
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
          maxWidth: '58rem',
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(18, 18, 22, 0.96)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
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
                Utilizamos cookies propias y de sesión para gestionar tu carrito, autenticar tu cuenta y personalizar la experiencia en nuestra web según nuestra{' '}
                <Link to="/terminos-y-privacidad" className="text-primary text-decoration-underline">
                  Política de Privacidad
                </Link>.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 w-100 w-md-auto flex-wrap flex-sm-nowrap justify-content-end">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-outline-secondary btn-sm font-montserrat fw-semibold px-3 py-2 flex-grow-1 flex-sm-grow-0 d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
            >
              <span>{showDetails ? 'Ocultar detalles' : 'Ver cuáles se guardan'}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={handleAcceptEssential}
              className="btn btn-secondary btn-sm font-montserrat fw-semibold px-3 py-2 flex-grow-1 flex-sm-grow-0"
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
          </div>
        </div>

        {/* Panel Desplegable de Detalle de Cookies */}
        {showDetails && (
          <div className="mt-3 pt-3 border-top border-border font-montserrat">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Info size={15} className="text-primary" />
              <span className="fw-bold text-text small">Detalle y Clasificación de Cookies Utilizadas:</span>
            </div>

            <div className="row g-2">
              {/* Categoría 1 */}
              <div className="col-12 col-md-4">
                <div className="p-3 rounded-3 bg-surface border border-border h-100">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-text small d-flex align-items-center gap-1">
                      <Lock size={13} className="text-primary" /> Técnicas & Sesión
                    </span>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success" style={{ fontSize: '0.68rem' }}>
                      Se Guarda Siempre
                    </span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                    Almacena autenticación JWT, carrito de compras y token CSRF. Esencial para comprar.
                  </p>
                </div>
              </div>

              {/* Categoría 2 */}
              <div className="col-12 col-md-4">
                <div className="p-3 rounded-3 bg-surface border border-border h-100">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-text small d-flex align-items-center gap-1">
                      <CheckCircle2 size={13} className="text-info" /> Preferencias
                    </span>
                    <span className="badge bg-info bg-opacity-25 text-info border border-info" style={{ fontSize: '0.68rem' }}>
                      Se Guarda
                    </span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                    Guarda tus favoritos locales y tu consentimiento para no volver a mostrar este aviso.
                  </p>
                </div>
              </div>

              {/* Categoría 3 */}
              <div className="col-12 col-md-4">
                <div className="p-3 rounded-3 bg-surface border border-border h-100">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-text small">Analíticas / Medición</span>
                    <span className="badge bg-warning bg-opacity-25 text-warning border border-warning" style={{ fontSize: '0.68rem' }}>
                      Opcional
                    </span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                    Métricas de tráfico para optimización. <strong>No se guardan</strong> si pulsas "Solo Necesarias".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
