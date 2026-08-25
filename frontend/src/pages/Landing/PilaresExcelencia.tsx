import { Shield, Sparkles, Sliders, Palette } from 'lucide-react';

export default function PilaresExcelencia() {
  const pilares = [
    {
      index: '01 / TÉCNICA & PRECISIÓN',
      icon: <Sparkles size={24} className="text-primary" />,
      title: 'Estampado de Alta Definición',
      desc: 'Utilizamos tecnología DTF Textil y serigrafía de vanguardia con tintas pigmentadas ecológicas OEKO-TEX®. Cada trazo conserva una nitidez milimétrica y una gama tonal vibrante de gran impacto visual.',
    },
    {
      index: '02 / SOPORTES PREMIUM',
      icon: <Shield size={24} className="text-primary" />,
      title: 'Materiales Seleccionados',
      desc: 'Confecciones en algodón 100% peinado de alto gramaje, polerones de felpa pesada y drinkware de acero inoxidable con recubrimiento cerámico que garantizan confort insuperable y máxima durabilidad.',
    },
    {
      index: '03 / LIBERTAD TOTAL',
      icon: <Palette size={24} className="text-primary" />,
      title: 'Editor de Canvas en Vivo',
      desc: 'Nuestra suite de personalización te permite visualizar tu idea en tiempo real sobre siluetas tridimensionales, ajustar tipografías, colores e importar gráficos con cotización instantánea transparente.',
    },
    {
      index: '04 / COMPROMISO & RIGOR',
      icon: <Sliders size={24} className="text-primary" />,
      title: 'Curado Térmico & Control',
      desc: 'Cada prenda y pieza de vajilla atraviesa un proceso de termofijación controlada y rigurosa inspección manual. Respaldamos cada entrega con garantía de adherencia intacta ante ciclos de lavado.',
    },
  ];

  return (
    <section className="container-xxl py-5 my-4">
      <div className="text-center mb-5">
        <div className="eyebrow-badge mb-2">
          <span className="glyph">★</span>
          <span>ESTÁNDARES DE MANUFACTURA</span>
        </div>
        <h2 className="font-italiana fs-1 text-text">Pilares de Excelencia</h2>
        <p className="font-montserrat small text-muted mx-auto text-center" style={{ maxWidth: '34rem' }}>
          La disciplina técnica y la sofisticación estética detrás de cada pieza creada en nuestro taller.
        </p>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {pilares.map((p, idx) => (
          <div key={idx} className="col">
            <div
              className="bg-card border border-border rounded-4 p-4 h-100 d-flex flex-column justify-content-between hover-lift position-relative overflow-hidden"
              style={{
                transition: 'all 0.28s ease',
              }}
            >
              {/* Top ambient accent glow */}
              <div
                className="position-absolute top-0 end-0 p-3 pointer-events-none opacity-25"
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)',
                }}
              />

              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <span
                    className="font-montserrat fw-bold text-primary"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}
                  >
                    {p.index}
                  </span>
                  <div className="p-2 rounded-3 bg-elevated border border-border">
                    {p.icon}
                  </div>
                </div>

                <h3 className="font-italiana fs-4 text-text mb-3 lh-sm">
                  {p.title}
                </h3>

                <p className="font-montserrat text-muted small lh-base mb-0">
                  {p.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-top border-border">
                <span
                  className="font-montserrat text-primary text-uppercase fw-semibold"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}
                >
                  Estándar Escénico Certificado
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
