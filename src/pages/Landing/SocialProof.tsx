import { useEffect, useRef } from 'react';
import MasonryGallery from '../../components/shared/MasonryGallery';
import { fotosClientes } from '../../data/mockData';

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div ref={ref} className="fade-in">
        <div className="text-center mb-12">
          <h2 className="font-italiana text-4xl text-text mb-3">Lo dicen nuestros clientes</h2>
          <p className="font-montserrat text-sm text-muted max-w-lg mx-auto">
            Cada estampado tiene una historia. Estas son algunas de las nuestras.
          </p>
        </div>
        <MasonryGallery fotos={fotosClientes} />
      </div>
    </section>
  );
}
