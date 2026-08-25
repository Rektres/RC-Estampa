import { Sparkles } from 'lucide-react';

export default function MarqueeTicker() {
  const items = [
    'DTF TEXTIL ULTRA HD',
    'SERIGRAFÍA TEXTIL PREMIUM',
    'SUBLIMACIÓN ALTA FIDELIDAD',
    'DRINKWARE TÉRMICO & MUGS',
    'BORDADO DE ALTA DENSIDAD',
    'VINILO TEXTIL DE PRECISIÓN',
    'TINTAS OEKO-TEX® ECOLÓGICAS',
    'CURADO TÉRMICO INDUSTRIAL',
    'ENVÍOS A TODO CHILE',
  ];

  return (
    <div className="py-3 bg-surface border-bottom border-border overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-track">
          {/* First loop */}
          {items.map((item, i) => (
            <div key={`m1-${i}`} className="d-inline-flex align-items-center gap-3">
              <span
                className="font-montserrat fw-bold text-muted text-uppercase"
                style={{ fontSize: '0.75rem', letterSpacing: '0.18em' }}
              >
                {item}
              </span>
              <Sparkles size={12} className="text-primary opacity-60" />
            </div>
          ))}
          {/* Duplicate loop for continuous seamless infinite animation */}
          {items.map((item, i) => (
            <div key={`m2-${i}`} className="d-inline-flex align-items-center gap-3">
              <span
                className="font-montserrat fw-bold text-muted text-uppercase"
                style={{ fontSize: '0.75rem', letterSpacing: '0.18em' }}
              >
                {item}
              </span>
              <Sparkles size={12} className="text-primary opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
