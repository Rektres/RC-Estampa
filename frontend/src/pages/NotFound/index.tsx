import { Link } from 'react-router-dom';
import { Compass, ShoppingBag, Palette, Coffee, Home, ArrowLeft } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';

export default function NotFound() {
  useSEO({
    title: 'Página no encontrada (404)',
    description: 'La página que buscas no existe o ha sido movida. Explora nuestro catálogo de ropa y drinkware personalizado.',
  });

  return (
    <div className="container py-5 text-center my-auto d-flex flex-column align-items-center justify-content-center min-vh-75">
      <div className="py-5" style={{ maxWidth: '42rem' }}>
        {/* Glow Badge */}
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary-20 text-primary small font-montserrat fw-semibold mb-4 border border-primary">
          <Compass size={16} />
          <span>ERROR 404 · RUTA NO ENCONTRADA</span>
        </div>

        {/* Big Code */}
        <h1 className="font-italiana display-1 text-primary fw-bold mb-2" style={{ letterSpacing: '4px' }}>
          404
        </h1>

        <h2 className="font-italiana fs-2 text-text mb-3">
          Esta pieza no está en nuestro catálogo
        </h2>

        <p className="font-montserrat text-muted lead mb-5 px-3">
          El enlace que seguiste no existe o la prenda fue reubicada en una nueva colección. Puedes volver al inicio o explorar nuestras secciones principales:
        </p>

        {/* Grid de Accesos Rápidos */}
        <div className="row g-3 justify-content-center mb-5 font-montserrat">
          <div className="col-12 col-sm-6 col-md-3">
            <Link
              to="/catalogo"
              className="bg-card border border-border rounded-4 p-3 d-flex flex-column align-items-center justify-content-center text-decoration-none hover-card h-100"
            >
              <ShoppingBag size={24} className="text-primary mb-2" />
              <span className="fw-semibold text-text small">Ropa Urbana</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Poleras y Hoodies</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <Link
              to="/drinkware"
              className="bg-card border border-border rounded-4 p-3 d-flex flex-column align-items-center justify-content-center text-decoration-none hover-card h-100"
            >
              <Coffee size={24} className="text-primary mb-2" />
              <span className="fw-semibold text-text small">Drinkware</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Botellas y Mugs</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <Link
              to="/disenar"
              className="bg-card border border-border rounded-4 p-3 d-flex flex-column align-items-center justify-content-center text-decoration-none hover-card h-100"
            >
              <Palette size={24} className="text-primary mb-2" />
              <span className="fw-semibold text-text small">Taller 3D</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Personaliza en vivo</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <Link
              to="/"
              className="bg-card border border-border rounded-4 p-3 d-flex flex-column align-items-center justify-content-center text-decoration-none hover-card h-100"
            >
              <Home size={24} className="text-primary mb-2" />
              <span className="fw-semibold text-text small">Inicio</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Portada principal</span>
            </Link>
          </div>
        </div>

        {/* Botón principal */}
        <Link to="/" className="btn btn-primary font-montserrat fw-bold px-4 py-3 rounded-3 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={18} /> Volver a la Portada
        </Link>
      </div>
    </div>
  );
}
