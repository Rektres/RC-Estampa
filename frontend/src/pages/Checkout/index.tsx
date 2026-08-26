import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, ChevronRight, CreditCard, Building2, ShieldCheck } from 'lucide-react';
import CardPaymentForm from '../../components/checkout/CardPaymentForm';
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
  const [metodoPago, setMetodoPago] = useState<'mercadopago' | 'transferencia'>('mercadopago');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const totalAmount = total();
  const { data: editorCfg } = useAsync(() => catalogoApi.editor(), []);
  const regiones = editorCfg?.regiones ?? [];

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
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
      metodo_pago: metodoPago,
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

      // Si se seleccionó Mercado Pago y retornó URL de pago, redirigir al checkout pro
      if (metodoPago === 'mercadopago' && pedido.payment_url) {
        window.location.href = pedido.payment_url;
      } else {
        navigate(`/confirmacion?pedido_id=${pedido.numero}&email=${encodeURIComponent(data.email)}&metodo=${metodoPago}`);
      }
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
              <h2 className="font-montserrat fw-semibold text-text mb-3 d-flex align-items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Medio de pago
              </h2>
              <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                Completa tu compra de forma rápida y segura en nuestro checkout protegido.
              </p>

              {/* Selector de Medios de Pago */}
              <div className="d-flex flex-column gap-3 mb-4">
                {/* Opción 1: Tarjeta On-Site con Mercado Pago API */}
                <label
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                    metodoPago === 'mercadopago'
                      ? 'border-primary bg-elevated'
                      : 'border-border bg-card'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="mercadopago"
                    checked={metodoPago === 'mercadopago'}
                    onChange={() => setMetodoPago('mercadopago')}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="font-montserrat fw-bold text-text" style={{ fontSize: '0.92rem' }}>
                          Tarjeta de Crédito o Débito
                        </span>
                        <span className="badge bg-primary text-black font-montserrat fw-bold" style={{ fontSize: '0.65rem' }}>
                          PAGO DIRECTO EN EL SITIO
                        </span>
                      </div>
                    </div>
                    <p className="font-montserrat text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                      Visa, Mastercard, American Express, Redcompra y Mach. Sin salir de la tienda.
                    </p>
                    <div className="d-flex align-items-center gap-2 flex-wrap text-muted" style={{ fontSize: '0.72rem' }}>
                      <span className="badge bg-card text-text border border-border">Visa</span>
                      <span className="badge bg-card text-text border border-border">Mastercard</span>
                      <span className="badge bg-card text-text border border-border">Redcompra</span>
                      <span className="badge bg-card text-text border border-border">Cuotas</span>
                    </div>
                  </div>
                </label>

                {/* Opción 2: Transferencia Bancaria */}
                <label
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                    metodoPago === 'transferencia'
                      ? 'border-primary bg-elevated'
                      : 'border-border bg-card'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="transferencia"
                    checked={metodoPago === 'transferencia'}
                    onChange={() => setMetodoPago('transferencia')}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Building2 size={16} className="text-muted" />
                      <span className="font-montserrat fw-bold text-text" style={{ fontSize: '0.92rem' }}>
                        Transferencia Bancaria Directa
                      </span>
                    </div>
                    <p className="font-montserrat text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                      Genera el pedido y transfiere directamente a nuestra cuenta corriente. Tu pedido entrará a producción al validar el comprobante.
                    </p>
                  </div>
                </label>
              </div>

              {submitError && (
                <div className="alert alert-danger py-2 font-montserrat mb-3" style={{ fontSize: '0.875rem' }}>
                  {submitError}
                </div>
              )}

              {/* Si se eligió Mercado Pago, mostramos el formulario de tarjeta integrado */}
              {metodoPago === 'mercadopago' ? (
                <div className="pt-2 border-top border-border">
                  <h3 className="font-montserrat fw-bold text-text fs-6 mb-3">
                    Ingresa los datos de tu tarjeta
                  </h3>
                  <CardPaymentForm
                    totalAmount={totalAmount}
                    userName={user?.nombre || ''}
                    userEmail={user?.email || ''}
                    isSubmitting={isSubmitting}
                    onSubmit={async (cardData) => {
                      setSubmitError(null);
                      const formData = getValues();
                      const payload: PedidoInput = {
                        nombre: formData.nombre,
                        email: formData.email,
                        telefono: formData.telefono,
                        direccion: formData.direccion,
                        ciudad: formData.ciudad,
                        region: formData.region,
                        notas: formData.notas,
                        total: totalAmount,
                        metodo_pago: 'mercadopago',
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
                        const res = await pedidosApi.procesarPago({
                          token: cardData.token,
                          payment_method_id: cardData.payment_method_id,
                          installments: cardData.installments,
                          issuer_id: cardData.issuer_id,
                          doc_type: cardData.doc_type,
                          doc_number: cardData.doc_number,
                          payer_email: formData.email,
                          pedido_data: payload,
                        });

                        if (res.success || res.status === 'approved' || res.status === 'in_process') {
                          clearCart();
                          const num = res.pedido?.numero || 'RC-ESTAMPA';
                          navigate(`/confirmacion?pedido_id=${num}&email=${encodeURIComponent(formData.email)}&status=${res.status}&payment_id=${res.payment_id || ''}`);
                        } else {
                          setSubmitError(res.message || 'El pago fue rechazado. Intenta con otra tarjeta.');
                        }
                      } catch (err: unknown) {
                        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        setSubmitError(errorMsg || 'No se pudo procesar el pago con la tarjeta. Intenta nuevamente.');
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2 font-montserrat fw-bold shadow-sm"
                  >
                    <Building2 size={18} />
                    <span>{isSubmitting ? 'Confirmando pedido...' : 'Confirmar Pedido por Transferencia'}</span>
                  </button>

                  <div className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
                    <ShieldCheck size={14} className="text-primary" />
                    <span>Garantía de compra y seguimiento directo en taller</span>
                  </div>
                </div>
              )}
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
