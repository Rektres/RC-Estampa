import { useEffect, useRef } from 'react';
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
    <section className="container-xxl" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div ref={ref} className="fade-in">
        <div className="text-center mb-5">
          <h2 className="font-italiana fs-1 text-text mb-2">Lo dicen nuestros clientes</h2>
          <p className="font-montserrat small text-muted mx-auto" style={{ maxWidth: '32rem' }}>
            Cada estampado tiene una historia. Estas son algunas de las nuestras.
          </p>
        </div>
        <MasonryGallery fotos={fotos ?? []} />
      </div>
    </section>
  );
}
