import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils';
import { catalogoApi } from '../../api';
import { useAsync } from '../../api/hooks';
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
  const { data: editor } = useAsync(() => catalogoApi.editor(), []);
  const precios = editor?.precios ?? {};

  return (
    <div className="container py-5" style={{ maxWidth: '56rem' }}>
      <div className="text-center mb-5">
        <h1 className="font-italiana text-text mb-3" style={{ fontSize: '3rem' }}>Diseña el tuyo</h1>
        <p className="font-montserrat text-muted mx-auto" style={{ maxWidth: '28rem' }}>
          Elige el producto y personaliza cada detalle en nuestro editor.
        </p>
      </div>

      {/* Ropa */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <h2 className="font-montserrat fw-semibold text-muted text-uppercase mb-0" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>Ropa</h2>
          <div className="flex-grow-1 bg-border" style={{ height: '1px' }} />
        </div>
        <div className="d-grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {productos.filter((p) => p.grupo === 'Ropa').map((p) => (
            <button
              key={p.key}
              onClick={() => navigate(`/disenar/${p.key}`)}
              className="bg-card border border-border rounded p-4 d-flex flex-column align-items-center gap-3 w-100"
              style={{ cursor: 'pointer' }}
            >
              <div className="rounded-circle bg-elevated d-flex align-items-center justify-content-center" style={{ width: '4rem', height: '4rem' }}>
                <p.icon size={28} className="text-muted" />
              </div>
              <div className="text-center">
                <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.875rem' }}>{p.label}</p>
                <p className="font-montserrat text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{p.desc}</p>
                <p className="font-montserrat fw-bold text-primary mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                  desde {formatPrice(precios[p.key] ?? 0)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drinkware */}
      <div>
        <div className="d-flex align-items-center gap-3 mb-4">
          <h2 className="font-montserrat fw-semibold text-muted text-uppercase mb-0" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>Drinkware</h2>
          <div className="flex-grow-1 bg-border" style={{ height: '1px' }} />
        </div>
        <div className="d-grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {productos.filter((p) => p.grupo === 'Drinkware').map((p) => (
            <button
              key={p.key}
              onClick={() => navigate(`/disenar/${p.key}`)}
              className="bg-card border border-border rounded p-4 d-flex flex-column align-items-center gap-3 w-100"
              style={{ cursor: 'pointer' }}
            >
              <div className="rounded-circle bg-elevated d-flex align-items-center justify-content-center" style={{ width: '4rem', height: '4rem' }}>
                <p.icon size={28} className="text-muted" />
              </div>
              <div className="text-center">
                <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.875rem' }}>{p.label}</p>
                <p className="font-montserrat text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{p.desc}</p>
                <p className="font-montserrat fw-bold text-drinkware mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                  desde {formatPrice(precios[p.key] ?? 0)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
