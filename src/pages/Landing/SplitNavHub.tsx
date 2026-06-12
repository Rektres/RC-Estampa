import { Link } from 'react-router-dom';

export default function SplitNavHub() {
  const panels = [
    {
      to: '/catalogo',
      image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Ropa',
      subtitle: 'Urbana · Formal · Limitada',
      cta: 'Ver catálogo',
    },
    {
      to: '/drinkware',
      image: 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Drinkware',
      subtitle: 'Tazas · Termos · Vasos',
      cta: 'Ver drinkware',
    },
  ];

  return (
    <section className="flex flex-col md:flex-row w-full" style={{ height: '60vh', minHeight: '360px' }}>
      {panels.map((panel) => (
        <Link
          key={panel.to}
          to={panel.to}
          className="relative flex-1 overflow-hidden group flex items-center justify-center"
        >
          {/* Background image */}
          <img
            src={panel.image}
            alt={panel.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[rgba(26,26,26,0.55)] group-hover:bg-[rgba(26,26,26,0.45)] transition-colors duration-600" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
            <h2 className="font-italiana text-5xl md:text-6xl text-text tracking-wide">
              {panel.title}
            </h2>
            <p className="font-montserrat font-500 text-sm text-text/80 tracking-widest uppercase">
              {panel.subtitle}
            </p>
            <span className="mt-2 btn-secondary text-sm group-hover:bg-primary group-hover:text-black group-hover:border-primary">
              {panel.cta}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
