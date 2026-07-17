import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, ChevronRight, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils';
import { catalogoApi, pedidosApi, type PedidoInput } from '../../api';
import { useAsync } from '../../api/hooks';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const totalAmount = total();
  const { data: editorCfg } = useAsync(() => catalogoApi.editor(), []);
  const regiones = editorCfg?.regiones ?? [];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
    },
  });

  const hasDesignItems = items.some((i) => i.tipo === 'diseno');

  if (items.length === 0) {
    return (
      <div className="container text-center py-5" style={{ maxWidth: '36rem' }}>
        <ShoppingBag size={48} className="text-ghost d-block mx-auto mb-3" />
        <h2 className="font-italiana text-text mb-3" style={{ fontSize: '1.875rem' }}>Carrito vacío</h2>
        <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>Agrega productos para continuar</p>
        <Link to="/" className="btn btn-primary">Ir a la tienda</Link>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    const payload: PedidoInput = {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      ciudad: data.ciudad,
      region: data.region,
      notas: data.notas,
      total: totalAmount,
      items: items.map((it) => ({
        tipo: it.tipo,
        nombre: it.nombre,
        imagen: it.imagen,
        talla: it.talla,
        color: it.tipo === 'catalogo' ? it.color : undefined,
        prenda: it.tipo === 'diseno' ? it.prenda : undefined,
        color_base: it.tipo === 'diseno' ? it.color_base : undefined,
        linea: it.tipo === 'catalogo' ? it.linea : undefined,
        precio: it.precio ?? null,
        cantidad: it.cantidad,
        producto_id: it.tipo === 'catalogo' ? it.productoId : undefined,
        variante_id: it.tipo === 'catalogo' ? it.varianteId : undefined,
        diseno_id: it.tipo === 'diseno' ? it.disenoId : undefined,
      })),
    };
    try {
      const pedido = await pedidosApi.crear(payload);
      clearCart();
      navigate(`/confirmacion?pedido_id=${pedido.numero}&email=${encodeURIComponent(data.email)}`);
    } catch {
      setSubmitError('No se pudo procesar el pedido. Intenta nuevamente.');
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '64rem' }}>
      <h1 className="font-italiana text-text mb-4" style={{ fontSize: '2.25rem' }}>Checkout</h1>

      {/* Stepper */}
      <div className="d-flex align-items-center mb-5">
        {STEPS.map((s, i) => (
          <div key={s} className="d-flex align-items-center">
            <div className={`d-flex align-items-center gap-2 ${i + 1 <= step ? 'text-primary' : 'text-ghost'}`}>
              <span className={`rounded-circle border d-flex align-items-center justify-content-center font-montserrat fw-bold ${
                i + 1 < step ? 'bg-primary border-primary text-black' : i + 1 === step ? 'border-primary text-primary' : 'border-ghost'
              }`} style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.75rem' }}>
                {i + 1}
              </span>
              <span className="font-montserrat fw-medium d-none d-sm-block" style={{ fontSize: '0.875rem' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-3 text-ghost" />}
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Form */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          {/* Step 1 — Cart review */}
          {step >= 1 && (
            <div className="bg-card border border-border rounded p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="font-montserrat fw-semibold text-text mb-0">Resumen del pedido</h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="btn btn-link p-0 font-montserrat text-primary text-decoration-none" style={{ fontSize: '0.75rem' }}>
                    Editar
                  </button>
                )}
              </div>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                {items.map((item) => (
                  <li key={item.id} className="d-flex gap-3">
                    <img src={item.imagen} alt={item.nombre} className="object-fit-cover rounded bg-elevated flex-shrink-0" style={{ width: '56px', height: '72px' }} />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="font-montserrat fw-medium text-text text-truncate mb-0" style={{ fontSize: '0.875rem' }}>{item.nombre}</p>
                      <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {item.tipo === 'catalogo' ? `${item.talla} · ${item.color}` : `${item.prenda} · T${item.talla}`}
                        {' '}&times; {item.cantidad}
                      </p>
                    </div>
                    <p className="font-montserrat fw-bold text-primary flex-shrink-0 mb-0" style={{ fontSize: '0.875rem' }}>
                      {item.precio ? formatPrice(item.precio * item.cantidad) : 'A cotizar'}
                    </p>
                  </li>
                ))}
              </ul>
              {hasDesignItems && (
                <div className="mt-3 p-3 bg-elevated rounded border border-primary-20">
                  <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    Los precios de tus diseños personalizados serán confirmados por nuestro equipo antes de procesar el cobro. Te notificaremos por email.
                  </p>
                </div>
              )}
              {step === 1 && (
                <button onClick={() => setStep(2)} className="btn btn-primary w-100 mt-4 py-2">
                  Continuar con el envío
                </button>
              )}
            </div>
          )}

          {/* Step 2 — Shipping */}
          {step >= 2 && (
            <div className="bg-card border border-border rounded p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="font-montserrat fw-semibold text-text mb-0">Datos de entrega</h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="btn btn-link p-0 font-montserrat text-primary text-decoration-none" style={{ fontSize: '0.75rem' }}>
                    Editar
                  </button>
                )}
              </div>
              <form className="d-flex flex-column gap-4">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Nombre completo *</label>
                    <input {...register('nombre')} className="form-control bg-elevated font-montserrat" />
                    {errors.nombre && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Email *</label>
                    <input type="email" {...register('email')} className="form-control bg-elevated font-montserrat" />
                    {errors.email && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Teléfono</label>
                  <input {...register('telefono')} placeholder="+56 9 XXXX XXXX" className="form-control bg-elevated font-montserrat" />
                </div>
                <div>
                  <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Dirección *</label>
                  <input {...register('direccion')} placeholder="Calle, número, depto/casa" className="form-control bg-elevated font-montserrat" />
                  {errors.direccion && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.direccion.message}</p>}
                </div>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Ciudad *</label>
                    <input {...register('ciudad')} className="form-control bg-elevated font-montserrat" />
                    {errors.ciudad && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.ciudad.message}</p>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Región *</label>
                    <select {...register('region')} className="form-select bg-elevated font-montserrat">
                      <option value="">Selecciona...</option>
                      {regiones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{errors.region.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Notas del pedido</label>
                  <textarea {...register('notas')} rows={2} placeholder="Instrucciones especiales de entrega..." className="form-control bg-elevated font-montserrat" style={{ resize: 'none' }} />
                </div>
                {step === 2 && (
                  <button type="button" onClick={() => setStep(3)} className="btn btn-primary w-100 py-2">
                    Continuar al pago
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step >= 3 && (
            <div className="bg-card border border-border rounded p-4">
              <h2 className="font-montserrat fw-semibold text-text mb-4 d-flex align-items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Pago seguro
              </h2>
              <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                Serás redirigido a MercadoPago para completar tu compra de forma segura.
              </p>
              {submitError && (
                <div className="alert alert-danger py-2 font-montserrat" style={{ fontSize: '0.875rem' }}>{submitError}</div>
              )}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              >
                <CreditCard size={18} />
                {isSubmitting ? 'Procesando...' : 'Pagar con MercadoPago'}
              </button>
              <p className="font-montserrat text-ghost text-center mt-3 mb-0" style={{ fontSize: '0.75rem' }}>
                Transacción segura y encriptada
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="col-12 col-lg-4">
          <div className="bg-card border border-border rounded p-4 position-sticky" style={{ top: '6rem' }}>
            <h3 className="font-montserrat fw-semibold text-text text-uppercase mb-3" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>Total del pedido</h3>
            <div className="d-flex flex-column gap-3 mb-3">
              <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
                <span className="text-muted">Subtotal</span>
                <span className="text-text">{totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}</span>
              </div>
              <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
                <span className="text-muted">Envío</span>
                <span className="text-text">A calcular</span>
              </div>
            </div>
            <div className="border-top border-border pt-3 d-flex justify-content-between font-montserrat fw-bold text-text">
              <span>Total</span>
              <span className="text-primary fs-5">{totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
