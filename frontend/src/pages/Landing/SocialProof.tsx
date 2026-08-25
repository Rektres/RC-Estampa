import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import MasonryGallery from '../../components/shared/MasonryGallery';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const { data: fotos } = useAsync(() => catalogoApi.fotos(), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add('visible')),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="container-xxl py-5 my-4">
      <div ref={ref} className="fade-in">
        <div className="text-center mb-5">
          <div className="eyebrow-badge mb-2">
            <span className="glyph">★</span>
            <span>COMUNIDAD & TESTIMONIOS</span>
          </div>
          <h2 className="font-italiana fs-1 text-text mb-2">Lo Dicen Quienes Crean con Nosotros</h2>
          <div className="d-flex justify-content-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} className="text-primary" style={{ fill: 'currentColor' }} />
            ))}
          </div>
          <p className="font-montserrat small text-muted mx-auto text-center" style={{ maxWidth: '34rem' }}>
            Cada estampado encierra una historia, una marca o un momento irrepetible. Estas son algunas de nuestras producciones en manos de sus creadores.
          </p>
        </div>

        <MasonryGallery fotos={fotos ?? []} />
      </div>
    </section>
  );
}

