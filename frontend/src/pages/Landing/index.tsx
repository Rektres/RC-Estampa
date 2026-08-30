import HeroEscenico from './HeroEscenico';
import TrustBar from './TrustBar';
import MarqueeTicker from './MarqueeTicker';
import PilaresExcelencia from './PilaresExcelencia';
import Destacados from './Destacados';
import ManifiestoEscenico from './ManifiestoEscenico';
import PlatformPaths from './PlatformPaths';
import GarantiaModulo from './GarantiaModulo';
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
    <div className="bg-surface">
      {/* 1. Hero con Cover Flow 3D + Titular + Doble CTA + Preview */}
      <HeroEscenico />

      {/* 2. Barra de Estadísticas y Confianza (Trust Bar) */}
      <TrustBar />

      {/* 3. Carrusel Infinito Orgánico de Marcas y Técnicas */}
      <MarqueeTicker />

      {/* 4. Grilla de los 4 Pilares de Excelencia */}
      <PilaresExcelencia />

      {/* 5. Catálogo Técnico con Filter Chips Dinámicos y Cards */}
      <Destacados />

      {/* 6. Manifiesto de Marca con Orbe Holográfico Interactivo */}
      <ManifiestoEscenico />

      {/* 7. Platform Paths (Recorridos por Tipo de Audiencia) */}
      <PlatformPaths />

      {/* 8. Módulo de Garantías y Certificaciones Oficiales */}
      <GarantiaModulo />

      {/* 9. Testimonios y Social Proof con Mosaico */}
      <SocialProof />

      {/* 10. Preguntas Frecuentes con Schema.org FAQPage */}
      <FAQEscenico />

      {/* 11. Formulario / Cotizador Luxury Box */}
      <LuxuryBoxCotizacion />
    </div>
  );
}

