import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, ChevronRight, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils';
import { regiones } from '../../data/mockData';

const schema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().min(5, 'Ingresa la dirección completa'),
  ciudad: z.string().min(2, 'Requerido'),
  region: z.string().min(2, 'Selecciona una región'),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Carrito', 'Datos de envío', 'Pago'];

export default function Checkout() {
  const [step, setStep] = useState(1);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const totalAmount = total();

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
    },
  });

  const hasDesignItems = items.some((i) => i.tipo === 'diseno');

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-ghost mx-auto mb-4" />
        <h2 className="font-italiana text-3xl text-text mb-3">Carrito vacío</h2>
        <p className="font-montserrat text-sm text-muted mb-6">Agrega productos para continuar</p>
        <Link to="/" className="btn-primary">Ir a la tienda</Link>
      </div>
    );
  }

  async function onSubmit(_data: FormData) {
    await new Promise((r) => setTimeout(r, 800));
    const pedidoId = `RC-${Date.now().toString().slice(-8)}`;
    clearCart();
    navigate(`/confirmacion?pedido_id=${pedidoId}&email=${encodeURIComponent(getValues('email'))}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-italiana text-4xl text-text mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-primary' : 'text-ghost'}`}>
              <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-montserrat text-xs font-700 ${
                i + 1 < step ? 'bg-primary border-primary text-black' : i + 1 === step ? 'border-primary text-primary' : 'border-ghost'
              }`}>
                {i + 1}
              </span>
              <span className="font-montserrat text-sm font-500 hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-3 text-ghost" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1 — Cart review */}
          {step >= 1 && (
            <div className="bg-card border border-border rounded-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-montserrat font-600 text-text">Resumen del pedido</h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="font-montserrat text-xs text-primary hover:text-primary-dark">
                    Editar
                  </button>
                )}
              </div>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <img src={item.imagen} alt={item.nombre} className="w-14 h-18 object-cover rounded-sm bg-elevated flex-shrink-0" style={{ height: '72px' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-montserrat font-500 text-sm text-text truncate">{item.nombre}</p>
                      <p className="font-montserrat text-xs text-muted">
                        {item.tipo === 'catalogo' ? `${item.talla} · ${item.color}` : `${item.prenda} · T${item.talla}`}
                        {' '}&times; {item.cantidad}
                      </p>
                    </div>
                    <p className="font-montserrat font-700 text-sm text-primary flex-shrink-0">
                      {item.precio ? formatPrice(item.precio * item.cantidad) : 'A cotizar'}
                    </p>
                  </li>
                ))}
              </ul>
              {hasDesignItems && (
                <div className="mt-4 p-3 bg-elevated rounded-sm border border-primary/20">
                  <p className="font-montserrat text-xs text-muted">
                    Los precios de tus diseños personalizados serán confirmados por nuestro equipo antes de procesar el cobro. Te notificaremos por email.
                  </p>
                </div>
              )}
              {step === 1 && (
                <button onClick={() => setStep(2)} className="btn-primary w-full mt-6 py-3 text-sm">
                  Continuar con el envío
                </button>
              )}
            </div>
          )}

          {/* Step 2 — Shipping */}
          {step >= 2 && (
            <div className="bg-card border border-border rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-montserrat font-600 text-text">Datos de entrega</h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="font-montserrat text-xs text-primary hover:text-primary-dark">
                    Editar
                  </button>
                )}
              </div>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-montserrat font-600 text-sm text-text block mb-2">Nombre completo *</label>
                    <input {...register('nombre')} className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary" />
                    {errors.nombre && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="font-montserrat font-600 text-sm text-text block mb-2">Email *</label>
                    <input type="email" {...register('email')} className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary" />
                    {errors.email && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="font-montserrat font-600 text-sm text-text block mb-2">Teléfono</label>
                  <input {...register('telefono')} placeholder="+56 9 XXXX XXXX" className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="font-montserrat font-600 text-sm text-text block mb-2">Dirección *</label>
                  <input {...register('direccion')} placeholder="Calle, número, depto/casa" className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary" />
                  {errors.direccion && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.direccion.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-montserrat font-600 text-sm text-text block mb-2">Ciudad *</label>
                    <input {...register('ciudad')} className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary" />
                    {errors.ciudad && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.ciudad.message}</p>}
                  </div>
                  <div>
                    <label className="font-montserrat font-600 text-sm text-text block mb-2">Región *</label>
                    <select {...register('region')} className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary">
                      <option value="">Selecciona...</option>
                      {regiones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="font-montserrat text-xs text-red-400 mt-1">{errors.region.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="font-montserrat font-600 text-sm text-text block mb-2">Notas del pedido</label>
                  <textarea {...register('notas')} rows={2} placeholder="Instrucciones especiales de entrega..." className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary resize-none" />
                </div>
                {step === 2 && (
                  <button type="button" onClick={() => setStep(3)} className="btn-primary w-full py-3 text-sm">
                    Continuar al pago
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step >= 3 && (
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-montserrat font-600 text-text mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Pago seguro
              </h2>
              <p className="font-montserrat text-sm text-muted mb-6">
                Serás redirigido a MercadoPago para completar tu compra de forma segura.
              </p>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                {isSubmitting ? 'Procesando...' : 'Pagar con MercadoPago'}
              </button>
              <p className="font-montserrat text-xs text-ghost text-center mt-3">
                Transacción segura y encriptada
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
            <h3 className="font-montserrat font-600 text-sm text-text uppercase tracking-wider mb-4">Total del pedido</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between font-montserrat text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-text">{totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}</span>
              </div>
              <div className="flex justify-between font-montserrat text-sm">
                <span className="text-muted">Envío</span>
                <span className="text-text">A calcular</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-montserrat font-700 text-text">
              <span>Total</span>
              <span className="text-primary text-lg">{totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
