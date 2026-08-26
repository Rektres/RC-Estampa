import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ShoppingBag, MessageCircle, Building2 } from 'lucide-react';

export default function Confirmacion() {
  const [params] = useSearchParams();
  const pedidoId = params.get('pedido_id') || params.get('external_reference') || 'RC-XXXXXXXX';
  const email = params.get('email') ?? '';
  const statusParam = params.get('status') || params.get('collection_status');
  const paymentId = params.get('payment_id') || params.get('collection_id');
  const metodo = params.get('metodo') ?? '';

  const isApproved = statusParam === 'approved' || statusParam === 'success';
  const isFailure = statusParam === 'failure' || statusParam === 'rejected' || statusParam === 'null';
  const isPending = statusParam === 'pending' || statusParam === 'in_process';
  const isTransferencia = metodo === 'transferencia';

  return (
    <div className="container text-center py-5" style={{ maxWidth: '42rem' }}>
      {/* Icono de Estado */}
      {isFailure ? (
        <div className="rounded-circle bg-danger-subtle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '5rem', height: '5rem' }}>
          <AlertCircle size={40} className="text-danger" />
        </div>
      ) : isPending ? (
        <div className="rounded-circle bg-warning-subtle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '5rem', height: '5rem' }}>
          <Clock size={40} className="text-warning" />
        </div>
      ) : (
        <div className="rounded-circle bg-drinkware-20 d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '5rem', height: '5rem' }}>
          <CheckCircle size={40} className="text-drinkware" />
        </div>
      )}

      {/* Titular */}
      <h1 className="font-italiana text-text mb-2" style={{ fontSize: '2.5rem' }}>
        {isFailure
          ? 'Pago no completado'
          : isPending
          ? 'Pago en proceso de validación'
          : isApproved
          ? '¡Pago y Pedido Confirmados!'
          : '¡Pedido Registrado con Éxito!'}
      </h1>

      <p className="font-montserrat text-muted mb-2">
        Número de orden: <span className="text-text fw-bold">{pedidoId}</span>
      </p>

      {paymentId && (
        <p className="font-montserrat text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
          ID de transacción Mercado Pago: <span className="text-text">{paymentId}</span>
        </p>
      )}

      {email && (
        <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          Enviamos el comprobante a <span className="text-text fw-semibold">{email}</span>
        </p>
      )}

      {/* Mensaje de Pago Fallido */}
      {isFailure && (
        <div className="alert alert-warning text-start font-montserrat small p-3 mb-4 rounded-3 border">
          <strong>Atención:</strong> La transacción en Mercado Pago no se completó o fue rechazada. Tu pedido se encuentra guardado en estado <em>Pendiente</em>. Puedes reintentar el pago o coordinar directamente por WhatsApp.
        </div>
      )}

      {/* Instrucciones de Transferencia Bancaria */}
      {isTransferencia && (
        <div className="bg-card border border-primary-30 rounded-4 p-4 mb-4 text-start">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Building2 size={20} className="text-primary" />
            <h3 className="font-montserrat fw-bold text-text mb-0 fs-6">
              Datos para Transferencia Bancaria
            </h3>
          </div>
          <div className="bg-elevated p-3 rounded-3 font-montserrat small d-flex flex-column gap-1 mb-3">
            <div><strong>Banco:</strong> Banco Santander / BancoEstado</div>
            <div><strong>Tipo de Cuenta:</strong> Cuenta Corriente / Vista</div>
            <div><strong>Titular:</strong> RC Estampa SpA</div>
            <div><strong>RUT:</strong> 77.XXX.XXX-K</div>
            <div><strong>Email para comprobante:</strong> pagos@rcestampa.cl</div>
            <div><strong>Asunto:</strong> Pedido {pedidoId}</div>
          </div>
          <p className="font-montserrat text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
            Una vez realizada la transferencia, envía el comprobante adjuntando tu número de pedido por WhatsApp para iniciar la producción de inmediato.
          </p>
        </div>
      )}

      {/* Mensaje de Confirmación y Notificación */}
      {!isFailure && (
        <div className="bg-card border border-border rounded-4 p-4 mb-4 text-start shadow-sm">
          <p className="font-montserrat text-text mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
            Hemos recibido tu orden y ya se encuentra en cola de producción. Te enviamos un correo electrónico a <span className="text-primary fw-bold">{email || 'tu casilla'}</span> con el desglose de productos y el comprobante de pago.
          </p>

          <div className="row g-3 pt-3 border-top border-border font-montserrat" style={{ fontSize: '0.85rem' }}>
            <div className="col-12 col-sm-6">
              <span className="text-muted d-block small">Tiempo de producción:</span>
              <span className="text-text fw-semibold">3 a 5 días hábiles</span>
            </div>
            <div className="col-12 col-sm-6">
              <span className="text-muted d-block small">Despacho:</span>
              <span className="text-text fw-semibold">A todo Chile con código de seguimiento</span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <Link to="/mi-cuenta" className="btn btn-primary d-inline-flex align-items-center gap-2 justify-content-center px-4 py-2">
          <span>Ver seguimiento en Mi Cuenta</span>
        </Link>
        <Link to="/" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 justify-content-center px-4 py-2">
          <ShoppingBag size={16} />
          Volver a la tienda
        </Link>
        <a
          href={`https://wa.me/56944830378?text=${encodeURIComponent(`Hola RC Estampa, acabo de realizar el pedido ${pedidoId}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary d-inline-flex align-items-center gap-2 justify-content-center px-4 py-2"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

