import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Award, AlertCircle } from 'lucide-react';

interface Props {
  estado: string;
  fechaCreacion?: string;
  fechaPago?: string;
  className?: string;
}

export default function PedidoTimeline({ estado, fechaCreacion, fechaPago, className = '' }: Props) {
  const st = (estado || '').toLowerCase();

  const isCancelado = st === 'cancelado';

  // Determinar nivel de avance (0 to 4)
  let activeStepIndex = 0;
  if (st === 'pagado') activeStepIndex = 1;
  else if (st === 'en_proceso') activeStepIndex = 2;
  else if (st === 'enviado') activeStepIndex = 3;
  else if (st === 'entregado') activeStepIndex = 4;

  const steps = [
    {
      id: 'pago',
      title: 'Pago Aprobado',
      desc: fechaPago ? 'Comprobante y pago verificado' : 'Validación y recepción de orden',
      icon: <CheckCircle2 size={18} />,
    },
    {
      id: 'taller',
      title: 'En Taller / Confección',
      desc: 'Grabado láser y estampado DTF en proceso',
      icon: <Package size={18} />,
    },
    {
      id: 'enviado',
      title: 'Despachado',
      desc: 'En tránsito con courier a domicilio',
      icon: <Truck size={18} />,
    },
    {
      id: 'entregado',
      title: 'Entregado',
      desc: 'Pedido entregado a conformidad',
      icon: <Award size={18} />,
    },
  ];

  if (isCancelado) {
    return (
      <div className={`p-3 rounded-3 bg-danger-subtle border border-danger-subtle d-flex align-items-center gap-3 ${className}`}>
        <AlertCircle size={24} className="text-danger flex-shrink-0" />
        <div>
          <h6 className="font-montserrat fw-bold text-danger mb-0 fs-6">Pedido Cancelado</h6>
          <p className="font-montserrat text-danger-emphasis small mb-0">Esta orden fue anulada o reembolsada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pedido-timeline-wrapper ${className}`}>
      <div className="d-flex align-items-center justify-content-between position-relative my-3">
        {/* Línea conectora de fondo */}
        <div
          className="position-absolute start-0 end-0 top-50 translate-middle-y bg-secondary"
          style={{ height: '3px', opacity: 0.2, zIndex: 1 }}
        />
        {/* Línea conectora activa (dorada) */}
        <div
          className="position-absolute start-0 top-50 translate-middle-y transition-all"
          style={{
            height: '3px',
            backgroundColor: 'var(--brand-primary)',
            width: `${Math.max(0, Math.min(100, (activeStepIndex - 1) * 33.33))}%`,
            zIndex: 2,
            transition: 'width 0.4s ease',
          }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = activeStepIndex > stepNumber;
          const isCurrent = activeStepIndex === stepNumber;
          const isPending = activeStepIndex < stepNumber;

          return (
            <div
              key={step.id}
              className="d-flex flex-column align-items-center text-center position-relative"
              style={{ zIndex: 3, width: '25%' }}
            >
              {/* Círculo indicador de estado */}
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                  isCurrent
                    ? 'bg-primary text-dark shadow-sm border border-2 border-white'
                    : isCompleted
                    ? 'bg-primary text-dark'
                    : 'bg-elevated text-muted border border-border'
                }`}
                style={{
                  width: isCurrent ? '2.5rem' : '2.1rem',
                  height: isCurrent ? '2.5rem' : '2.1rem',
                  boxShadow: isCurrent ? '0 0 16px rgba(201, 168, 76, 0.55)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {step.icon}
              </div>

              {/* Título y descripción */}
              <div className="mt-2 px-1">
                <span
                  className={`font-montserrat d-block fw-semibold lh-sm ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-text' : 'text-muted'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {step.title}
                </span>
                <span
                  className="font-montserrat text-muted d-none d-md-block mt-1 lh-xs"
                  style={{ fontSize: '0.68rem' }}
                >
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
