import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MessageCircle } from 'lucide-react';

export default function Confirmacion() {
  const [params] = useSearchParams();
  const pedidoId = params.get('pedido_id') ?? 'RC-XXXXXXXX';
  const email = params.get('email') ?? '';

  return (
    <div className="container text-center py-5" style={{ maxWidth: '36rem' }}>
      <div className="rounded-circle bg-drinkware-20 d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '5rem', height: '5rem' }}>
        <CheckCircle size={40} className="text-drinkware" />
      </div>

      <h1 className="font-italiana text-text mb-3" style={{ fontSize: '3rem' }}>¡Pedido confirmado!</h1>
      <p className="font-montserrat text-muted mb-2">
        Número de pedido: <span className="text-text fw-bold">{pedidoId}</span>
      </p>
      {email && (
        <p className="font-montserrat text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          Recibirás un email de confirmación en{' '}
          <span className="text-text">{email}</span>
        </p>
      )}

      <div className="bg-card border border-border rounded p-4 mb-4 text-start d-flex flex-column gap-3">
        <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.875rem' }}>¿Qué sigue?</p>
        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
          {[
            'Recibirás un email con los detalles de tu pedido',
            'Nuestro equipo preparará tu estampado con cuidado',
            'Te notificaremos cuando tu pedido sea enviado',
            'Ante cualquier duda, escríbenos por WhatsApp',
          ].map((step, i) => (
            <li key={i} className="d-flex align-items-start gap-2 font-montserrat text-muted" style={{ fontSize: '0.875rem' }}>
              <span className="text-primary fw-bold flex-shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2 justify-content-center">
          <ShoppingBag size={16} />
          Seguir comprando
        </Link>
        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary d-inline-flex align-items-center gap-2 justify-content-center"
        >
          <MessageCircle size={16} />
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
