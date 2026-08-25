import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, CheckCircle2, ClipboardList, Clock, Package, Sparkles } from 'lucide-react';
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
  { icon: ClipboardList, title: '1. Especifica tu idea', desc: 'Prenda, soporte, colores y referencias' },
  { icon: Clock, title: '2. Cotización en < 24h', desc: 'Presupuesto formal y asesoría técnica' },
  { icon: Package, title: '3. Aprobación y Taller', desc: 'Producción en alta fidelidad y despacho' },
];

export default function Personalizado() {
  const [submitted, setSubmitted] = useState(false);
  const [numero, setNumero] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      linea: 'urbana',
    },
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
      <div className="container py-5" style={{ maxWidth: '42rem' }}>
        <div className="luxury-box text-center p-5">
          <div className="rounded-circle bg-primary-20 d-flex align-items-center justify-content-center mx-auto mb-4 border border-primary-30" style={{ width: '4.5rem', height: '4.5rem' }}>
            <CheckCircle2 size={36} className="text-primary" />
          </div>
          <div className="eyebrow-badge mb-3">
            <span className="glyph">★</span>
            <span>SOLICITUD REGISTRADA CON ÉXITO</span>
          </div>
          <h2 className="font-italiana text-white fs-1 mb-3">¡Solicitud Recibida en Atelier!</h2>
          <p className="font-montserrat text-muted mb-2">
            Código de seguimiento: <span className="text-primary fw-bold fs-5 font-montserrat">{numero}</span>
          </p>
          <p className="font-montserrat text-muted mb-4 lead" style={{ fontSize: '0.95rem' }}>
            Nuestro equipo técnico revisará tus requerimientos gráficos y te enviará una propuesta detallada en menos de 24 horas hábiles.
          </p>
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-4 py-3 d-inline-flex align-items-center gap-2 justify-content-center rounded-3 hover-lift"
          >
            <MessageCircle size={18} />
            <span>Coordinar con un Asesor por WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '54rem' }}>
      {/* Header & Steps */}
      <div className="text-center mb-5">
        <div className="eyebrow-badge mb-3">
          <span className="glyph">★</span>
          <span>ATELIER DE PEDIDOS PERSONALIZADOS</span>
        </div>
        <h1 className="font-italiana text-white fs-1 mb-2">Solicitud de Cotización a Medida</h1>
        <p className="font-montserrat text-muted mx-auto" style={{ maxWidth: '34rem' }}>
          Cuéntanos sobre tu proyecto. Elaboramos cotizaciones personalizadas para marcas, producciones especiales, eventos y empresas.
        </p>

        {/* Steps Cards */}
        <div className="row g-3 mt-4 mb-2">
          {pasos.map((paso, i) => (
            <div key={i} className="col-12 col-md-4">
              <div className="p-3 rounded-4 bg-card border border-border h-100 d-flex flex-column align-items-center text-center gap-2 hover-lift">
                <div className="rounded-circle bg-primary-10 border border-primary-20 p-2 d-flex align-items-center justify-content-center">
                  <paso.icon size={20} className="text-primary" />
                </div>
                <span className="font-montserrat fw-semibold text-text small">{paso.title}</span>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>{paso.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form in Luxury Box */}
      <div className="luxury-box">
        <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
          {/* Linea Selection */}
          <div>
            <label className="form-label font-montserrat fw-semibold text-text small mb-2 d-block">
              Línea de Confección *
            </label>
            <div className="row g-3">
              {(['urbana', 'formal'] as const).map((l) => (
                <label key={l} className="col-6 mb-0" style={{ cursor: 'pointer' }}>
                  <input type="radio" value={l} {...register('linea')} className="visually-hidden" />
                  <div className={`border rounded-4 p-3 text-center h-100 transition-all ${lineaSel === l ? 'border-primary bg-primary-10 shadow-sm' : 'border-border bg-card'}`}>
                    <p className="font-montserrat fw-bold text-text text-capitalize mb-1 small">{l === 'urbana' ? 'Línea Urbana (Streetwear)' : 'Línea Formal & Corporativa'}</p>
                    <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.72rem' }}>{l === 'urbana' ? 'Poleras 240g, Hoodies, Joggers' : 'Camisas, Polos Piqué, Chaquetas'}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.linea && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.linea.message}</p>}
          </div>

          {/* Contact Data */}
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Nombre / Contacto *</label>
              <input
                {...register('nombre')}
                className="form-control bg-elevated border-border font-montserrat py-2 text-text"
                placeholder="Tu nombre completo o empresa"
              />
              {errors.nombre && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Correo Electrónico *</label>
              <input
                type="email"
                {...register('email')}
                className="form-control bg-elevated border-border font-montserrat py-2 text-text"
                placeholder="tu@correo.com"
              />
              {errors.email && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone & Item Type */}
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Teléfono / WhatsApp</label>
              <input
                {...register('telefono')}
                className="form-control bg-elevated border-border font-montserrat py-2 text-text"
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Tipo de Prenda / Soporte *</label>
              <select
                {...register('tipo_prenda')}
                className="form-select bg-elevated border-border font-montserrat py-2 text-text"
              >
                <option value="">Selecciona una opción...</option>
                {['Polera Oversized', 'Hoodie / Polerón Canguro', 'Chaqueta', 'Camisa / Blusa', 'Polera Piqué / Polo', 'Drinkware / Botella Térmica', 'Gorra / Accesorio'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.tipo_prenda && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.tipo_prenda.message}</p>}
            </div>
          </div>

          {/* Size & Budget */}
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Talla / Volumen Estimado</label>
              <input
                {...register('talla')}
                className="form-control bg-elevated border-border font-montserrat py-2 text-text"
                placeholder="ej: 25 unidades surtidas (S, M, L)"
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label font-montserrat fw-semibold text-text small">Presupuesto Estimado</label>
              <input
                {...register('presupuesto_estimado')}
                className="form-control bg-elevated border-border font-montserrat py-2 text-text"
                placeholder="ej: $50.000 - $150.000"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label font-montserrat fw-semibold text-text small">
              Descripción del Diseño & Especificaciones *
            </label>
            <textarea
              {...register('descripcion')}
              rows={4}
              className="form-control bg-elevated border-border font-montserrat text-text"
              style={{ resize: 'none' }}
              placeholder="Detalla ubicación del estampado (pecho, espalda, mangas), cantidad de colores, soporte y referencias deseadas..."
            />
            {errors.descripcion && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.descripcion.message}</p>}
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-0 font-montserrat small">{error}</div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 py-3 rounded-3 font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-2 hover-lift"
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Cotización'}</span>
            </button>
          </div>

          <div className="d-flex align-items-center justify-content-center gap-2 text-center pt-2">
            <MessageCircle size={15} className="text-primary" />
            <a
              href="https://wa.me/56944830378"
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat text-muted text-decoration-none small hover-lift"
            >
              ¿Prefieres atención inmediata y envío de archivos por WhatsApp?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

