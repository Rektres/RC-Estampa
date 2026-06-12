import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MessageCircle } from 'lucide-react';

export default function Confirmacion() {
  const [params] = useSearchParams();
  const pedidoId = params.get('pedido_id') ?? 'RC-XXXXXXXX';
  const email = params.get('email') ?? '';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-drinkware/20 flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={40} className="text-drinkware" />
      </div>

      <h1 className="font-italiana text-5xl text-text mb-4">¡Pedido confirmado!</h1>
      <p className="font-montserrat text-muted mb-2">
        Número de pedido: <span className="text-text font-700">{pedidoId}</span>
      </p>
      {email && (
        <p className="font-montserrat text-sm text-muted mb-8">
          Recibirás un email de confirmación en{' '}
          <span className="text-text">{email}</span>
        </p>
      )}

      <div className="bg-card border border-border rounded-sm p-6 mb-8 text-left space-y-3">
        <p className="font-montserrat font-600 text-sm text-text">¿Qué sigue?</p>
        <ul className="space-y-2">
          {[
            'Recibirás un email con los detalles de tu pedido',
            'Nuestro equipo preparará tu estampado con cuidado',
            'Te notificaremos cuando tu pedido sea enviado',
            'Ante cualquier duda, escríbenos por WhatsApp',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 font-montserrat text-sm text-muted">
              <span className="text-primary font-700 flex-shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
          <ShoppingBag size={16} />
          Seguir comprando
        </Link>
        <a
          href="https://wa.me/56944830378"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center gap-2 justify-center"
        >
          <MessageCircle size={16} />
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
