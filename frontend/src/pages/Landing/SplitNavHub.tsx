import { Link } from 'react-router-dom';

export default function SplitNavHub() {
  const panels = [
    {
      to: '/catalogo',
      image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Ropa',
      subtitle: 'Urbana · Formal · Limitada',
      cta: 'Ver catálogo',
    },
    {
      to: '/drinkware',
      image: 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Drinkware',
      subtitle: 'Tazas · Termos · Vasos',
      cta: 'Ver drinkware',
    },
  ];

  return (
    <section className="d-flex flex-column flex-md-row w-100" style={{ height: '60vh', minHeight: '360px' }}>
      {panels.map((panel) => (
        <Link
          key={panel.to}
          to={panel.to}
          className="position-relative flex-fill overflow-hidden d-flex align-items-center justify-content-center text-decoration-none"
        >
          {/* Background image */}
          <img
            src={panel.image}
            alt={panel.title}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          />
          {/* Overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(26,26,26,0.55)' }}
          />
          {/* Content */}
          <div
            className="position-relative d-flex flex-column align-items-center gap-3 text-center px-5"
            style={{ zIndex: 10 }}
          >
            <h2
              className="font-italiana text-text"
              style={{ fontSize: 'clamp(3rem, 5vw, 3.75rem)', letterSpacing: '0.025em' }}
            >
              {panel.title}
            </h2>
            <p
              className="font-montserrat fw-medium small text-uppercase"
              style={{ color: 'rgba(240,237,232,0.8)', letterSpacing: '0.1em' }}
            >
              {panel.subtitle}
            </p>
            <span className="mt-2 btn btn-outline-primary btn-sm">
              {panel.cta}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
