import { useState, useEffect, useRef } from 'react';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
import type { Producto, ProductoVajilla } from '../../types';

type Filtro = 'todos' | 'urbana' | 'formal' | 'drinkware';

const filtros: { key: Filtro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'urbana', label: 'Ropa Urbana' },
  { key: 'formal', label: 'Ropa Formal' },
  { key: 'drinkware', label: 'Drinkware' },
];

export default function Destacados() {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: prod } = useAsync(() => catalogoApi.productosAll(), []);
  const { data: vaj } = useAsync(() => catalogoApi.drinkwareAll(), []);

  const allDestacados: (Producto | ProductoVajilla)[] = [
    ...(prod ?? []).filter((p) => p.destacado),
    ...(vaj ?? []).filter((p) => p.destacado),
  ];

  const filtered = allDestacados.filter((p) => {
    if (filtro === 'todos') return true;
    return p.linea === filtro;
  });

  useEffect(() => {
    const el = sectionRef.current;
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
      <div ref={sectionRef} className="fade-in">
        <div
          className="d-flex flex-column flex-sm-row align-items-sm-end justify-content-between gap-4"
          style={{ marginBottom: '2.5rem' }}
        >
          <h2 className="font-italiana fs-1 text-text">Nueva Colección</h2>
          {/* Filter pills */}
          <div className="d-flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                style={{ fontSize: '0.75rem' }}
                className={`font-montserrat fw-semibold px-3 py-2 rounded-pill border ${
                  filtro === f.key
                    ? 'bg-primary text-black border-primary'
                    : 'bg-transparent text-muted border-border'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          {filtered.slice(0, 8).map((p) => (
            <div className="col" key={p.id}>
              <HoverSwapCard producto={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
