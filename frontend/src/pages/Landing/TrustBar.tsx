export default function TrustBar() {
  const stats = [
    { number: '+15.000', label: 'PRENDAS ESTAMPADAS', highlight: 'Alta Definición' },
    { number: '99.8%', label: 'SATISFACCIÓN CLIENTES', highlight: 'Reseñas Verificadas' },
    { number: '24-48h', label: 'TIEMPO DE PRODUCCIÓN', highlight: 'Despacho Exprés' },
    { number: '100%', label: 'COBERTURA EN CHILE', highlight: 'Envíos Nacionales' },
  ];

  return (
    <section className="border-top border-bottom border-border bg-card py-4 my-3 position-relative">
      <div className="container-xxl">
        <div className="row g-4 align-items-center text-center text-md-start">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-6 col-md-3">
              <div className="d-flex flex-column gap-1 px-2 border-end-md border-border">
                <span
                  className="font-italiana fs-2 text-primary lh-1 d-block fw-bold"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {stat.number}
                </span>
                <span
                  className="font-montserrat fw-bold text-text text-uppercase"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.14em' }}
                >
                  {stat.label}
                </span>
                <span
                  className="font-montserrat text-muted text-uppercase"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}
                >
                  {stat.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
