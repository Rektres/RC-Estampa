import { ArrowRight, Building2, Flame, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlatformPaths() {
  const paths = [
    {
      kicker: 'MODA & STREETWEAR',
      title: 'Colecciones Urbanas\n& Marcas Creadoras',
      summary: 'Prendas con cortes modernos oversized, telas de algodón pesado y estampados DTF en pecho y espalda con texturas suaves al tacto para marcas independientes y uso cotidiano.',
      to: '/catalogo?linea=urbana',
      cta: 'Ver Colección Urbana',
      icon: <Flame size={22} className="text-primary" />,
      bg: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      kicker: 'PROYECTOS & EMPRESAS',
      title: 'Merchandising Corporativo\n& Equipos de Alto Nivel',
      summary: 'Dotaciones corporativas de alta durabilidad, regalos institucionales y uniformes estampados con logotipo corporativo y colores de identidad de marca inalterables.',
      to: '/personalizado',
      cta: 'Cotizar para Empresas',
      icon: <Building2 size={22} className="text-primary" />,
      bg: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      kicker: 'EVENTOS & DRINKWARE',
      title: 'Botellas Térmicas, Mugs\n& Celebraciones Exclusivas',
      summary: 'Drinkware en acero inoxidable térmico y tazas de cerámica grabadas a fuego lento para regalos memorables en bodas, festivales, congresos y lanzamientos.',
      to: '/drinkware',
      cta: 'Explorar Drinkware',
      icon: <Wine size={22} className="text-primary" />,
      bg: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  return (
    <section className="container-xxl py-5 my-3">
      <div className="text-center mb-5">
        <div className="eyebrow-badge mb-2">
          <span className="glyph">★</span>
          <span>SOLUCIONES POR AUDIENCIA</span>
        </div>
        <h2 className="font-italiana fs-1 text-text">Recorridos a tu Medida</h2>
        <p className="font-montserrat small text-muted mx-auto text-center" style={{ maxWidth: '34rem' }}>
          Selecciona el formato ideal según tus requerimientos de volumen, soporte o personalización.
        </p>
      </div>

      <div className="row row-cols-1 row-cols-lg-3 g-4">
        {paths.map((p, idx) => (
          <div key={idx} className="col">
            <div
              className="position-relative rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-between p-4 p-md-5 hover-lift border border-border"
              style={{ minHeight: '380px' }}
            >
              {/* Background image with overlay */}
              <img
                src={p.bg}
                alt={p.title}
                className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                style={{ zIndex: 0 }}
              />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 platform-path-overlay"
                style={{
                  zIndex: 1,
                }}
              />

              {/* Content */}
              <div className="position-relative" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <span
                    className="font-montserrat fw-bold text-primary text-uppercase"
                    style={{ fontSize: '0.7rem', letterSpacing: '0.14em' }}
                  >
                    {p.kicker}
                  </span>
                  <div className="p-2 rounded-3 bg-card border border-border">
                    {p.icon}
                  </div>
                </div>

                <h3 className="font-italiana text-text fs-3 mb-3 whitespace-pre-line lh-sm">
                  {p.title}
                </h3>

                <p className="font-montserrat text-muted small lh-base mb-0">
                  {p.summary}
                </p>
              </div>

              <div className="position-relative pt-4 mt-3 border-top border-border" style={{ zIndex: 2 }}>
                <Link
                  to={p.to}
                  className="btn btn-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2 font-montserrat fw-semibold"
                  style={{ fontSize: '0.82rem' }}
                >
                  <span>{p.cta}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
