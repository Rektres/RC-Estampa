import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, CheckCircle, ClipboardList, Clock, Package } from 'lucide-react';

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
  const [numero] = useState(() => `PER-${Date.now().toString().slice(-6)}`);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(_data: FormData) {
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-drinkware/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-drinkware" />
        </div>
        <h2 className="font-italiana text-4xl text-text mb-3">¡Solicitud enviada!</h2>
        <p className="font-montserrat text-muted mb-2">
          Tu número de solicitud es: <span className="text-text font-600">{numero}</span>
        </p>
        <p className="font-montserrat text-sm text-muted mb-8">
          Revisaremos tu pedido y te enviaremos una cotización en menos de 24 horas.
        </p>
        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2 justify-center mx-auto w-fit"
        >
          <MessageCircle size={16} />
          Hablar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-elevated border border-border rounded-sm px-8 py-6 mb-10">
          <h1 className="font-italiana text-4xl text-text mb-2">Diseña tu Prenda</h1>
          <p className="font-montserrat text-sm text-muted">Pedido personalizado — lo hacemos nosotros</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {pasos.map((paso, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <paso.icon size={20} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-montserrat font-600 text-sm text-text">{paso.title}</p>
                <p className="font-montserrat text-xs text-muted mt-1">{paso.desc}</p>
              </div>
              {i < pasos.length - 1 && (
                <div className="hidden sm:block absolute translate-x-full text-muted">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Linea */}
        <div>
          <label className="font-montserrat font-600 text-sm text-text block mb-3">
            Línea *
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['urbana', 'formal'] as const).map((l) => (
              <label key={l} className="relative cursor-pointer">
                <input type="radio" value={l} {...register('linea')} className="sr-only peer" />
                <div className="border border-border rounded-sm p-4 text-center peer-checked:border-primary peer-checked:bg-primary/10 hover:border-muted transition-colors">
                  <p className="font-montserrat font-600 text-sm text-text capitalize">{l === 'urbana' ? 'Urbana' : 'Formal'}</p>
                  <p className="font-montserrat text-xs text-muted mt-1">{l === 'urbana' ? 'Poleras, hoodies, joggers' : 'Camisas, polos, chaquetas'}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.linea && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.linea.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Nombre *</label>
            <input
              {...register('nombre')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
              placeholder="Tu nombre"
            />
            {errors.nombre && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Email *</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
              placeholder="tu@email.com"
            />
            {errors.email && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Teléfono</label>
            <input
              {...register('telefono')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
              placeholder="+56 9 XXXX XXXX"
            />
          </div>
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Tipo de prenda *</label>
            <select
              {...register('tipo_prenda')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
            >
              <option value="">Selecciona...</option>
              {['Polera', 'Hoodie', 'Chaqueta', 'Camisa', 'Polo', 'Pantalón', 'Gorra'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo_prenda && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.tipo_prenda.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Talla</label>
            <select
              {...register('talla')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
            >
              <option value="">Sin especificar</option>
              {['XS','S','M','L','XL','XXL'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="font-montserrat font-600 text-sm text-text block mb-2">Presupuesto estimado</label>
            <input
              {...register('presupuesto_estimado')}
              className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
              placeholder="ej: $30.000 - $50.000"
            />
          </div>
        </div>

        <div>
          <label className="font-montserrat font-600 text-sm text-text block mb-2">
            Descripción del diseño *
          </label>
          <textarea
            {...register('descripcion')}
            rows={5}
            className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary resize-none"
            placeholder="Describe el diseño que quieres: colores, texto, imágenes, referencia de estilo..."
          />
          {errors.descripcion && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.descripcion.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>

        <div className="flex items-center justify-center gap-2 text-center">
          <MessageCircle size={14} className="text-primary" />
          <a
            href="https://wa.me/56944830378"
            target="_blank"
            rel="noopener noreferrer"
            className="font-montserrat text-sm text-muted hover:text-text transition-colors"
          >
            ¿Prefieres hablar directamente?
          </a>
        </div>
      </form>
    </div>
  );
}
