import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

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
      'Puedes ingresar a la sección de Cotización en el menú, seleccionar las cantidades estimadas y cargar tus detalles. También puedes escribirnos directamente por WhatsApp al +56 9 7441 9828 y recibirás atención y presupuesto en menos de 2 horas hábiles.',
  },
];

export default function FAQEscenico() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);


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
    <section className="py-5 bg-base position-relative overflow-hidden">
      {/* Inyección JSON-LD para Schema.org FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container py-4">
        {/* Eyebrow & Titular */}
        <div className="text-center max-w-xl mx-auto mb-5">
          <div className="eyebrow-badge mb-3">
            <span className="live-dot" />
            <span>Resolución de Dudas Frecuentes</span>
          </div>
          <h2 className="font-italiana display-5 fw-bold text-text mb-3">
            Preguntas Frecuentes & SRE Operativo
          </h2>
          <p className="font-montserrat text-muted small mb-0">
            Todo lo que necesitas saber sobre tiempos de producción, despacho a todo Chile y cotizaciones corporativas.
          </p>
        </div>

        {/* Acordeón Escénico */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">
            <div className="d-flex flex-column gap-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={faq.pregunta}
                    className="stage-card p-4 transition-all"
                    style={{
                      cursor: 'pointer',
                      borderLeft: isOpen ? '3px solid var(--brand-primary)' : undefined,
                    }}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <HelpCircle size={18} className="text-primary flex-shrink-0" />
                        <h3 className="font-montserrat fw-semibold text-text mb-0 fs-6">
                          {faq.pregunta}
                        </h3>
                      </div>
                      <ChevronDown
                        size={18}
                        className="text-muted flex-shrink-0 transition-all"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-top border-border">
                        <p className="font-montserrat text-muted small mb-0 leading-relaxed">
                          {faq.respuesta}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Asistencia Directa Banner */}
            <div className="stage-card p-4 mt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-circle bg-primary-10 text-primary">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h4 className="font-montserrat fw-semibold text-text fs-6 mb-1">
                    ¿Tienes un requerimiento especial o diseño a medida?
                  </h4>
                  <p className="font-montserrat text-muted small mb-0">
                    Habla directamente con un asesor técnico de taller en tiempo real.
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/56974419828"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm px-4 py-2 text-nowrap rounded-3 hover-lift"
              >
                Hablar con un Asesor
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
