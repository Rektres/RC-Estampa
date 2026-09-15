import HeroEscenico from './HeroEscenico';
import TrustBar from './TrustBar';
import MarqueeTicker from './MarqueeTicker';
import Destacados from './Destacados';
import PlatformPaths from './PlatformPaths';
import SocialProof from './SocialProof';
import FAQEscenico from './FAQEscenico';
import LuxuryBoxCotizacion from './LuxuryBoxCotizacion';
import { useSEO } from '../../hooks/useSEO';

export default function Landing() {
  useSEO({
    title: 'RC Estampa | E-Commerce de Estampado Textil & Drinkware Personalizado',
    description: 'Personalización y estampado de alta definición en poleras, polerones, camisas, vasos, termos, tazas y botellas térmicas. DTF Textil Ultra HD y grabado láser en Chile.',
    keywords: 'estampado textil santiago, dtf textil chile, poleras personalizadas, polerones estampados, vasos grabados, termos personalizados, tazas sublimadas, drinkware grabado, rc estampa',
  });

  return (
    <div className="bg-base">
      {/* 1. Hero con Cover Flow 3D + Titular + Doble CTA + Preview */}
      <HeroEscenico />

      {/* 2. Barra de Estadísticas y Confianza (Trust Bar) */}
      <TrustBar />

      {/* 3. Carrusel Infinito Orgánico de Marcas y Técnicas */}
      <MarqueeTicker />

      {/* 4. Catálogo Técnico con Filter Chips Dinámicos y Cards */}
      <Destacados />

      {/* 5. Platform Paths (Recorridos por Tipo de Audiencia) */}
      <PlatformPaths />

      {/* 6. Testimonios y Social Proof con Mosaico */}
      <SocialProof />

      {/* 7. Preguntas Frecuentes con Schema.org FAQPage */}
      <FAQEscenico />

      {/* 8. Formulario / Cotizador Luxury Box */}
      <LuxuryBoxCotizacion />
    </div>
  );
}

