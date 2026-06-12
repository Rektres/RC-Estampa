import { useNavigate } from 'react-router-dom';
import { preciosEditor } from '../../data/mockData';
import { formatPrice } from '../../utils';
import { Shirt, HardHat, Scissors, Coffee, Thermometer, GlassWater } from 'lucide-react';

const productos = [
  { key: 'polera', label: 'Polera', grupo: 'Ropa', icon: Shirt, desc: 'Estampado frontal o posterior' },
  { key: 'gorra', label: 'Gorra', grupo: 'Ropa', icon: HardHat, desc: 'Bordado frontal o lateral' },
  { key: 'pantalon', label: 'Pantalón', grupo: 'Ropa', icon: Scissors, desc: 'Estampado en pierna o cintura' },
  { key: 'taza', label: 'Taza', grupo: 'Drinkware', icon: Coffee, desc: 'Sublimación 360° o parcial' },
  { key: 'termo', label: 'Termo', grupo: 'Drinkware', icon: Thermometer, desc: 'Grabado o sublimación' },
  { key: 'vaso', label: 'Vaso', grupo: 'Drinkware', icon: GlassWater, desc: 'Sublimación en franja' },
];

export default function Disenador() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-italiana text-5xl text-text mb-3">Diseña el tuyo</h1>
        <p className="font-montserrat text-muted max-w-md mx-auto">
          Elige el producto y personaliza cada detalle en nuestro editor.
        </p>
      </div>

      {/* Ropa */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-montserrat font-600 text-sm text-muted uppercase tracking-wider">Ropa</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {productos.filter((p) => p.grupo === 'Ropa').map((p) => (
            <button
              key={p.key}
              onClick={() => navigate(`/disenar/${p.key}`)}
              className="group bg-card border border-border rounded-sm p-6 flex flex-col items-center gap-4 hover:border-primary hover:bg-elevated transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <p.icon size={28} className="text-muted group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-montserrat font-600 text-text text-sm">{p.label}</p>
                <p className="font-montserrat text-xs text-muted mt-1">{p.desc}</p>
                <p className="font-montserrat font-700 text-primary text-sm mt-2">
                  desde {formatPrice(preciosEditor[p.key as keyof typeof preciosEditor])}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drinkware */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-montserrat font-600 text-sm text-muted uppercase tracking-wider">Drinkware</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {productos.filter((p) => p.grupo === 'Drinkware').map((p) => (
            <button
              key={p.key}
              onClick={() => navigate(`/disenar/${p.key}`)}
              className="group bg-card border border-border rounded-sm p-6 flex flex-col items-center gap-4 hover:border-drinkware hover:bg-elevated transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-elevated group-hover:bg-drinkware/10 flex items-center justify-center transition-colors">
                <p.icon size={28} className="text-muted group-hover:text-drinkware transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-montserrat font-600 text-text text-sm">{p.label}</p>
                <p className="font-montserrat text-xs text-muted mt-1">{p.desc}</p>
                <p className="font-montserrat font-700 text-drinkware text-sm mt-2">
                  desde {formatPrice(preciosEditor[p.key as keyof typeof preciosEditor])}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
