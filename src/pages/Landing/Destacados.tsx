import { useState, useEffect, useRef } from 'react';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { productos, productosVajilla } from '../../data/mockData';
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

  const allDestacados: (Producto | ProductoVajilla)[] = [
    ...productos.filter((p) => p.destacado),
    ...productosVajilla.filter((p) => p.destacado),
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div ref={sectionRef} className="fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <h2 className="font-italiana text-4xl text-text">Nueva Colección</h2>
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`font-montserrat text-xs font-600 px-4 py-2 rounded-full border transition-all duration-200 ${
                  filtro === f.key
                    ? 'bg-primary text-black border-primary'
                    : 'bg-transparent text-muted border-border hover:border-muted hover:text-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.slice(0, 8).map((p) => (
            <HoverSwapCard key={p.id} producto={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
