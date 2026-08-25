import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItem {
  pregunta: string;
  respuesta: string;
}

const FAQS: FAQItem[] = [
  {
    pregunta: '¿Qué técnicas de estampado utilizan en el taller?',
    respuesta:
      'Trabajamos con tecnología DTF Textil Ultra HD de alta definición, serigrafía tradicional para tirajes medianos/grandes y sublimación térmica a 200°C en drinkware y vajilla de acero inoxidable. Nuestras tintas cuentan con certificación ecológica OEKO-TEX®.',
  },
  {
    pregunta: '¿Existe una cantidad mínima de compra para estampar?',
    respuesta:
      'No. En nuestro editor de canvas puedes diseñar y pedir desde 1 sola unidad sin mínimos. Para empresas, bandas o producciones por volumen ofrecemos tarifas preferenciales escalonadas a partir de 10, 50 y 100+ unidades.',
  },
  {
    pregunta: '¿Cuáles son los tiempos de producción y despacho?',
    respuesta:
      'Nuestros tiempos habituales de manufactura son de 24 a 48 horas hábiles para pedidos individuales y express, y de 3 a 5 días hábiles para tirajes corporativos. Realizamos envíos asegurados a todo el territorio nacional chileno.',
  },
  {
    pregunta: '¿Cómo debo cuidar y lavar mis prendas estampadas para máxima durabilidad?',
    respuesta:
      'Recomendamos lavar la prenda del revés con agua fría en ciclo suave y evitar el uso de secadora o blanqueadores agresivos. Al momento del planchado, nunca aplicar calor directo sobre el estampado (planchar del revés o con un paño intermedio). De esta forma el estampado resiste más de 50 lavados sin desgaste.',
  },
  {
    pregunta: '¿Qué formatos de archivo gráfico aceptan para pedidos y cotizaciones?',
    respuesta:
      'Aceptamos imágenes en formato PNG con fondo transparente (mínimo 300 DPI), archivos vectoriales en PDF, Illustrator (.AI), Photoshop (.PSD) o SVG. Nuestro equipo técnico revisa y optimiza cada archivo sin costo antes de entrar a producción.',
  },
  {
    pregunta: '¿Cómo solicito una cotización formal para mi empresa o evento?',
    respuesta:
      'Puedes ingresar a la sección de Cotización en el menú, seleccionar las cantidades estimadas y cargar tus detalles. También puedes escribirnos directamente por WhatsApp al +56 9 4483 0378 y recibirás atención y presupuesto en menos de 2 horas hábiles.',
  },
];

export default function FAQEscenico() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  // Schema FAQPage para rich snippets de Google
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.respuesta,
      },
    })),
  };

  return (
    <section className="container-xxl py-5 my-4">
      {/* Inyección JSON-LD para Schema.org FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-5">
        <div className="eyebrow-badge mb-2">
          <span className="glyph">★</span>
          <span>RESPUESTAS & ASISTENCIA TÉCNICA</span>
        </div>
        <h2 className="font-italiana fs-1 text-text mb-2">Preguntas Frecuentes</h2>
        <p className="font-montserrat small text-muted mx-auto text-center" style={{ maxWidth: '34rem' }}>
          Todo lo que necesitas saber sobre nuestros procesos de estampado, calidades textiles, tiempos y pedidos a medida.
        </p>
      </div>

      <div className="mx-auto" style={{ maxWidth: '48rem' }}>
        <div className="d-flex flex-column gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-3 overflow-hidden transition-all"
                style={{
                  borderColor: isOpen ? 'var(--card-border-gold)' : 'var(--card-border)',
                  boxShadow: isOpen ? 'var(--card-shadow)' : 'none',
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-100 p-4 d-flex align-items-center justify-content-between text-start bg-transparent border-0 font-montserrat fw-semibold text-text gap-3"
                  style={{ fontSize: '0.95rem' }}
                  aria-expanded={isOpen}
                >
                  <div className="d-flex align-items-center gap-3">
                    <HelpCircle
                      size={18}
                      className={isOpen ? 'text-primary flex-shrink-0' : 'text-muted flex-shrink-0'}
                    />
                    <span>{faq.pregunta}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className="text-muted flex-shrink-0 transition-transform"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-top border-border">
                    <p
                      className="font-montserrat text-muted small mb-0 pt-3"
                      style={{ lineHeight: '1.75' }}
                    >
                      {faq.respuesta}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Micro Banner */}
        <div className="text-center mt-5 p-4 rounded-4 bg-elevated border border-border d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 text-start">
            <Sparkles size={20} className="text-primary flex-shrink-0" />
            <div>
              <span className="font-montserrat fw-semibold text-text small d-block">
                ¿Tienes una consulta específica sobre tu proyecto?
              </span>
              <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
                Nuestro equipo técnico te responde por WhatsApp de lunes a sábado.
              </span>
            </div>
          </div>
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm px-4 py-2 text-nowrap rounded-3 hover-lift"
          >
            Hablar con un Asesor
          </a>
        </div>
      </div>
    </section>
  );
}
