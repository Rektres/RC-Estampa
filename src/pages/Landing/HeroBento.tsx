import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Star } from 'lucide-react';
import LineaBadge from '../../components/shared/LineaBadge';

export default function HeroBento() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
        }}
      >
        {/* Block 1 — large, spans 2 rows on left */}
        <div
          className="relative rounded-[20px] overflow-hidden border border-border cursor-pointer group"
          style={{ gridRow: '1 / 3', minHeight: '480px' }}
          onClick={() => navigate('/catalogo')}
        >
          <img
            src="https://images.pexels.com/photos/4210846/pexels-photo-4210846.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Ropa urbana RC Estampa"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.02]"
          />
          {/* Hover overlay dorado 8% */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-200" />
          {/* Bottom overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-center gap-3">
            <LineaBadge linea="urbana" />
            <span className="font-montserrat font-500 text-sm text-text">Catálogo Ropa</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        {/* Block 2 — drinkware, top right */}
        <div
          className="relative rounded-[20px] overflow-hidden border border-border cursor-pointer group"
          onClick={() => navigate('/drinkware')}
          style={{ minHeight: '220px' }}
        >
          <img
            src="https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Drinkware estampado"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-200" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <LineaBadge linea="drinkware" />
            <span className="font-montserrat font-500 text-sm text-text">Drinkware</span>
            <ArrowRight size={16} className="text-drinkware" />
          </div>
        </div>

        {/* Block 3 + 4 — two small blocks */}
        <div className="grid grid-cols-2 gap-4">
          {/* Block 3 — tintas ecológicas */}
          <div className="rounded-[20px] bg-elevated border border-border flex flex-col items-center justify-center p-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-drinkware/20 flex items-center justify-center">
              <Leaf size={22} className="text-drinkware" />
            </div>
            <p className="font-montserrat font-600 text-sm text-text text-center leading-snug">
              Tintas ecológicas
            </p>
            <p className="font-montserrat text-xs text-muted text-center">
              100% seguras para uso cotidiano
            </p>
          </div>

          {/* Block 4 — review */}
          <div className="rounded-[20px] bg-card border border-border flex flex-col justify-between p-5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-primary text-primary" />
              ))}
            </div>
            <div>
              <p className="font-italiana text-base text-text italic leading-snug mb-2">
                "El estampado quedó perfecto. Increíble calidad."
              </p>
              <p className="font-montserrat text-xs text-muted">— Valentina R.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
