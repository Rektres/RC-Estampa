import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, CheckCircle, ClipboardList, Clock, Package } from 'lucide-react';
import { cotizacionesApi } from '../../api';

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  linea: z.enum(['urbana', 'formal']),
  tipo_prenda: z.string().min(1, 'Selecciona un tipo de prenda'),
  talla: z.string().optional(),
  descripcion: z.string().min(30, 'Describe tu pedido con al menos 30 caracteres'),
  presupuesto_estimado: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const pasos = [
  { icon: ClipboardList, title: 'Completa el formulario', desc: 'Cuéntanos qué quieres estampar' },
  { icon: Clock, title: 'Te cotizamos en 24h', desc: 'Revisamos tu solicitud y enviamos precio' },
  { icon: Package, title: 'Confirmás y producimos', desc: 'Aceptás la cotización y comenzamos' },
];

export default function Personalizado() {
  const [submitted, setSubmitted] = useState(false);
  const [numero, setNumero] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const lineaSel = watch('linea');

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const res = await cotizacionesApi.crear(data);
      setNumero(res.numero);
      setSubmitted(true);
    } catch {
      setError('No se pudo enviar la solicitud. Intenta nuevamente.');
    }
  }

  if (submitted) {
    return (
      <div className="container text-center py-5" style={{ maxWidth: '36rem' }}>
        <div className="rounded-circle bg-drinkware-20 d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '4rem', height: '4rem' }}>
          <CheckCircle size={32} className="text-drinkware" />
        </div>
        <h2 className="font-italiana text-text mb-3" style={{ fontSize: '2.25rem' }}>¡Solicitud enviada!</h2>
        <p className="font-montserrat text-muted mb-2">
          Tu número de solicitud es: <span className="text-text fw-semibold">{numero}</span>
        </p>
        <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          Revisaremos tu pedido y te enviaremos una cotización en menos de 24 horas.
        </p>
        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary d-inline-flex align-items-center gap-2 justify-content-center"
        >
          <MessageCircle size={16} />
          Hablar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '48rem' }}>
      {/* Header */}
      <div className="text-center mb-5">
        <div className="bg-elevated border border-border rounded px-4 py-4 mb-5">
          <h1 className="font-italiana text-text mb-2" style={{ fontSize: '2.25rem' }}>Diseña tu Prenda</h1>
          <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.875rem' }}>Pedido personalizado — lo hacemos nosotros</p>
        </div>

        {/* Steps */}
        <div className="row g-4 mb-5">
          {pasos.map((paso, i) => (
            <div key={i} className="col-12 col-sm-4 d-flex flex-column align-items-center gap-3">
              <div className="rounded-circle bg-primary-20 d-flex align-items-center justify-content-center" style={{ width: '3rem', height: '3rem' }}>
                <paso.icon size={20} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.875rem' }}>{paso.title}</p>
                <p className="font-montserrat text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
        {/* Linea */}
        <div>
          <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>
            Línea *
          </label>
          <div className="row g-3">
            {(['urbana', 'formal'] as const).map((l) => (
              <label key={l} className="col-6 mb-0" style={{ cursor: 'pointer' }}>
                <input type="radio" value={l} {...register('linea')} className="visually-hidden" />
                <div className={`border rounded p-3 text-center h-100 ${lineaSel === l ? 'border-primary bg-primary-10' : 'border-border'}`}>
                  <p className="font-montserrat fw-semibold text-text text-capitalize mb-0" style={{ fontSize: '0.875rem' }}>{l === 'urbana' ? 'Urbana' : 'Formal'}</p>
                  <p className="font-montserrat text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{l === 'urbana' ? 'Poleras, hoodies, joggers' : 'Camisas, polos, chaquetas'}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.linea && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.linea.message}</p>}
        </div>

        <div className="row g-4">
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Nombre *</label>
            <input
              {...register('nombre')}
              className="form-control bg-elevated font-montserrat"
              placeholder="Tu nombre"
            />
            {errors.nombre && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Email *</label>
            <input
              type="email"
              {...register('email')}
              className="form-control bg-elevated font-montserrat"
              placeholder="tu@email.com"
            />
            {errors.email && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.email.message}</p>}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Teléfono</label>
            <input
              {...register('telefono')}
              className="form-control bg-elevated font-montserrat"
              placeholder="+56 9 XXXX XXXX"
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Tipo de prenda *</label>
            <select
              {...register('tipo_prenda')}
              className="form-select bg-elevated font-montserrat"
            >
              <option value="">Selecciona...</option>
              {['Polera', 'Hoodie', 'Chaqueta', 'Camisa', 'Polo', 'Pantalón', 'Gorra'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo_prenda && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.tipo_prenda.message}</p>}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Talla</label>
            <select
              {...register('talla')}
              className="form-select bg-elevated font-montserrat"
            >
              <option value="">Sin especificar</option>
              {['XS','S','M','L','XL','XXL'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Presupuesto estimado</label>
            <input
              {...register('presupuesto_estimado')}
              className="form-control bg-elevated font-montserrat"
              placeholder="ej: $30.000 - $50.000"
            />
          </div>
        </div>

        <div>
          <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>
            Descripción del diseño *
          </label>
          <textarea
            {...register('descripcion')}
            rows={5}
            className="form-control bg-elevated font-montserrat"
            style={{ resize: 'none' }}
            placeholder="Describe el diseño que quieres: colores, texto, imágenes, referencia de estilo..."
          />
          {errors.descripcion && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.descripcion.message}</p>}
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-0 font-montserrat" style={{ fontSize: '0.875rem' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-100 py-3"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>

        <div className="d-flex align-items-center justify-content-center gap-2 text-center">
          <MessageCircle size={14} className="text-primary" />
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="font-montserrat text-muted text-decoration-none"
            style={{ fontSize: '0.875rem' }}
          >
            ¿Prefieres hablar directamente?
          </a>
        </div>
      </form>
    </div>
  );
}
