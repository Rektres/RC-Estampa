import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, ChevronRight, CreditCard, Building2, ShieldCheck, MapPin, Plus } from 'lucide-react';
import CardPaymentForm from '../../components/checkout/CardPaymentForm';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils';
import { catalogoApi, pedidosApi, direccionesApi, type PedidoInput } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';

const schema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().min(5, 'Ingresa la dirección completa'),
  comuna: z.string().min(2, 'Ingresa la comuna'),
  ciudad: z.string().min(2, 'Requerido'),
  region: z.string().min(2, 'Selecciona una región'),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Carrito', 'Datos de envío', 'Pago'];

export default function Checkout() {
  useSEO({
    title: 'Finalizar Compra · Checkout Seguro',
    description: 'Completa tu pedido de ropa o drinkware personalizado con despacho a todo Chile.',
  });

  const [step, setStep] = useState(1);
  const [metodoPago, setMetodoPago] = useState<'mercadopago' | 'transferencia'>('mercadopago');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const totalAmount = total();
  const { data: editorCfg } = useAsync(() => catalogoApi.editor(), []);
  const regiones = editorCfg?.regiones ?? [];

  const [tipoDireccion, setTipoDireccion] = useState<'perfil' | 'otra'>(
    user?.direccion ? 'perfil' : 'otra'
  );
  const [guardarDireccion, setGuardarDireccion] = useState(false);

  const { register, handleSubmit, getValues, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
      telefono: user?.telefono ?? '',
      direccion: user?.direccion ?? '',
      comuna: user?.comuna ?? '',
      ciudad: user?.ciudad ?? '',
      region: user?.region ?? 'Región Metropolitana',
    },
  });

  useEffect(() => {
    if (user && tipoDireccion === 'perfil') {
      setValue('nombre', user.nombre || '');
      setValue('email', user.email || '');
      setValue('telefono', user.telefono || '');
      setValue('direccion', user.direccion || '');
      setValue('comuna', user.comuna || '');
      setValue('ciudad', user.ciudad || '');
      setValue('region', user.region || 'Región Metropolitana');
    }
  }, [user, tipoDireccion, setValue]);

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

  async function handleGuardarDireccionSiAplica(data: FormData) {
    if (guardarDireccion && user && tipoDireccion === 'otra') {
      try {
        await direccionesApi.crear({
          nombre_destinatario: data.nombre,
          direccion: data.direccion,
          comuna: data.comuna,
          ciudad: data.ciudad,
          region: data.region,
        });
      } catch {
        // Ignore error
      }
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    await handleGuardarDireccionSiAplica(data);

    const payload: PedidoInput = {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      comuna: data.comuna,
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
        <div className="col-12 col-lg-8">
          {/* Step 1 — Cart Review */}
          {step === 1 && (
            <div className="bg-card border border-border rounded p-4">
              <h2 className="font-montserrat fw-semibold text-text mb-4" style={{ fontSize: '1rem' }}>Revisa tu pedido</h2>
              <div className="d-flex flex-column gap-3 mb-4">
                {items.map((it) => (
                  <div key={it.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-border">
                    <div className="d-flex align-items-center gap-3">
                      {it.imagen && (
                        <img src={it.imagen} alt={it.nombre} className="rounded object-fit-cover" style={{ width: '3.5rem', height: '3.5rem' }} />
                      )}
                      <div>
                        <p className="font-montserrat fw-semibold text-text mb-1" style={{ fontSize: '0.875rem' }}>{it.nombre}</p>
                        <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                          {it.talla ? `Talla: ${it.talla}` : ''} {'color' in it && it.color ? `· Color: ${it.color}` : ''} · Cantidad: {it.cantidad}
                        </p>
                      </div>
                    </div>
                    <span className="font-montserrat fw-bold text-text">
                      {it.precio ? formatPrice(it.precio * it.cantidad) : 'A cotizar'}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary w-100 py-2">
                Continuar con el envío
              </button>
            </div>
          )}

          {/* Step 2 — Shipping Details */}
          {step === 2 && (
            <div className="bg-card border border-border rounded p-4">
              <h2 className="font-montserrat fw-semibold text-text mb-4" style={{ fontSize: '1rem' }}>Dirección de despacho</h2>

              {user?.direccion && (
                <div className="mb-4 d-flex flex-column gap-2 font-montserrat">
                  <label
                    className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                      tipoDireccion === 'perfil' ? 'border-primary bg-elevated' : 'border-border bg-card'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="tipo_dir"
                      checked={tipoDireccion === 'perfil'}
                      onChange={() => setTipoDireccion('perfil')}
                      className="mt-1"
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <strong className="text-text small">Usar mi dirección registrada de perfil</strong>
                      </div>
                      <p className="text-muted small mb-0 mt-1">
                        {user.direccion}, {user.comuna ? `${user.comuna}, ` : ''}{user.ciudad} ({user.region})
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                      tipoDireccion === 'otra' ? 'border-primary bg-elevated' : 'border-border bg-card'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="tipo_dir"
                      checked={tipoDireccion === 'otra'}
                      onChange={() => {
                        setTipoDireccion('otra');
                        setValue('direccion', '');
                        setValue('comuna', '');
                        setValue('ciudad', '');
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <Plus size={16} className="text-primary" />
                        <strong className="text-text small">Entregar en una dirección distinta</strong>
                      </div>
                      <p className="text-muted small mb-0 mt-1">
                        Ingresa una dirección de entrega diferente para este pedido.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <form className="d-flex flex-column gap-4 font-montserrat">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold text-text small">Nombre completo *</label>
                    <input {...register('nombre')} className="form-control bg-elevated" />
                    {errors.nombre && <p className="text-danger mt-1 mb-0 small">{errors.nombre.message}</p>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold text-text small">Email *</label>
                    <input type="email" {...register('email')} className="form-control bg-elevated" />
                    {errors.email && <p className="text-danger mt-1 mb-0 small">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="form-label fw-semibold text-text small">Teléfono / WhatsApp *</label>
                  <input {...register('telefono')} placeholder="+56 9 XXXX XXXX" className="form-control bg-elevated" />
                </div>

                <div>
                  <label className="form-label fw-semibold text-text small">Dirección *</label>
                  <input {...register('direccion')} placeholder="Calle, número, depto/casa" className="form-control bg-elevated" />
                  {errors.direccion && <p className="text-danger mt-1 mb-0 small">{errors.direccion.message}</p>}
                </div>

                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold text-text small">Comuna *</label>
                    <input {...register('comuna')} placeholder="Ej: Providencia / Las Condes" className="form-control bg-elevated" />
                    {errors.comuna && <p className="text-danger mt-1 mb-0 small">{errors.comuna.message}</p>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold text-text small">Ciudad *</label>
                    <input {...register('ciudad')} placeholder="Ej: Santiago / Valparaíso" className="form-control bg-elevated" />
                    {errors.ciudad && <p className="text-danger mt-1 mb-0 small">{errors.ciudad.message}</p>}
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold text-text small">Región *</label>
                    <select {...register('region')} className="form-select bg-elevated">
                      <option value="">Selecciona...</option>
                      {regiones.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="text-danger mt-1 mb-0 small">{errors.region.message}</p>}
                  </div>
                </div>

                {user && tipoDireccion === 'otra' && (
                  <div className="form-check p-3 bg-elevated rounded-3 border border-border">
                    <input
                      type="checkbox"
                      id="guardarDirCheck"
                      checked={guardarDireccion}
                      onChange={(e) => setGuardarDireccion(e.target.checked)}
                      className="form-check-input ms-0 me-2"
                    />
                    <label htmlFor="guardarDirCheck" className="form-check-label text-text small fw-semibold">
                      ¿Deseas guardar esta dirección para futuras compras en tu cuenta?
                    </label>
                  </div>
                )}

                <div>
                  <label className="form-label fw-semibold text-text small">Notas del pedido (Opcional)</label>
                  <textarea {...register('notas')} rows={2} placeholder="Instrucciones especiales de entrega..." className="form-control bg-elevated" style={{ resize: 'none' }} />
                </div>

                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleSubmit(async (data) => {
                      await handleGuardarDireccionSiAplica(data);
                      setStep(3);
                    })}
                    className="btn btn-primary w-100 py-2 fw-bold"
                  >
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
                    isSubmitting={isSubmitting}
                    onSubmit={async (cardData) => {
                      setSubmitError(null);
                      const formData = getValues();
                      const payload: PedidoInput = {
                        nombre: formData.nombre,
                        email: formData.email,
                        telefono: formData.telefono,
                        direccion: formData.direccion,
                        comuna: formData.comuna,
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
                          is_test_card: cardData.is_test_card,
                          card_last_digits: cardData.card_last_digits,
                        });

                        if (res.success || res.status === 'approved' || res.status === 'in_process') {
                          clearCart();
                          const num = res.pedido?.numero || 'RC-ESTAMPA';
                          navigate(`/confirmacion?pedido_id=${num}&email=${encodeURIComponent(formData.email)}&status=${res.status}&payment_id=${res.payment_id || ''}`);
                        } else {
                          setSubmitError(res.message || 'El pago fue rechazado. Intenta con otra tarjeta.');
                        }
                      } catch (err: unknown) {
                        const rawMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
                        let translated = rawMsg;
                        if (rawMsg.toLowerCase().includes('unauthorized use of live credentials')) {
                          translated = 'Las credenciales actuales son de producción y requieren una tarjeta bancaria real o cuenta de prueba autorizada.';
                        } else if (rawMsg.toLowerCase().includes('invalid token')) {
                          translated = 'La sesión de la tarjeta expiró. Por favor, reingresa los datos.';
                        } else if (!translated) {
                          translated = 'No se pudo procesar el pago con la tarjeta. Intenta nuevamente.';
                        }
                        setSubmitError(translated);
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
