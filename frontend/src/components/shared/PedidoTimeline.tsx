import { CheckCircle2, Package, Truck, Award, AlertCircle } from 'lucide-react';

interface Props {
  estado: string;
  fechaCreacion?: string;
  fechaPago?: string;
  className?: string;
}

export default function PedidoTimeline({ estado, fechaPago, className = '' }: Props) {
  const st = (estado || '').toLowerCase();
  const isCancelado = st === 'cancelado';

  // Nivel de avance (0 a 4)
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
      icon: <CheckCircle2 size={16} />,
    },
    {
      id: 'taller',
      title: 'En Taller / Confección',
      desc: 'Grabado láser y DTF en proceso',
      icon: <Package size={16} />,
    },
    {
      id: 'enviado',
      title: 'Despachado',
      desc: 'En tránsito con courier',
      icon: <Truck size={16} />,
    },
    {
      id: 'entregado',
      title: 'Entregado',
      desc: 'Entregado a conformidad',
      icon: <Award size={16} />,
    },
  ];

  if (isCancelado) {
    return (
      <div className={`p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 d-flex align-items-center gap-3 ${className}`}>
        <AlertCircle size={22} className="text-danger flex-shrink-0" />
        <div>
          <h6 className="font-montserrat fw-bold text-danger mb-0 fs-6">Pedido Cancelado</h6>
          <p className="font-montserrat text-muted small mb-0">Esta orden fue anulada o cancelada.</p>
        </div>
      </div>
    );
  }

  // Porcentaje de la barra activa entre el primer círculo (12.5%) y el último (87.5%)
  const progressPercent = activeStepIndex <= 1 ? 0 : Math.min(100, ((activeStepIndex - 1) / 3) * 100);

  return (
    <div className={`pedido-timeline-container font-montserrat w-100 ${className}`}>
      {/* Fila 1: Pistas y Círculos */}
      <div className="position-relative d-flex align-items-center justify-content-between" style={{ height: '42px' }}>
        {/* Línea base conectora */}
        <div
          className="position-absolute bg-secondary bg-opacity-25"
          style={{
            left: '12.5%',
            right: '12.5%',
            top: '50%',
            height: '3px',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        />

        {/* Línea dorada de progreso activo */}
        <div
          className="position-absolute transition-all"
          style={{
            left: '12.5%',
            width: `calc(75% * ${progressPercent / 100})`,
            top: '50%',
            height: '3px',
            backgroundColor: 'var(--brand-primary)',
            transform: 'translateY(-50%)',
            zIndex: 2,
            transition: 'width 0.4s ease-in-out',
          }}
        />

        {/* 4 Círculos de Etapa */}
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = activeStepIndex > stepNum;
          const isCurrent = activeStepIndex === stepNum;

          return (
            <div
              key={step.id}
              className="d-flex align-items-center justify-content-center"
              style={{ width: '25%', zIndex: 3 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                  isCurrent
                    ? 'bg-primary text-black fw-bold shadow-lg border border-2 border-white'
                    : isDone
                    ? 'bg-primary text-black'
                    : 'bg-elevated text-muted border border-border'
                }`}
                style={{
                  width: isCurrent ? '2.4rem' : '2.1rem',
                  height: isCurrent ? '2.4rem' : '2.1rem',
                  boxShadow: isCurrent ? '0 0 16px rgba(201, 168, 76, 0.6)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {step.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fila 2: Títulos y Descripciones Alineadas */}
      <div className="row g-1 text-center mt-2">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = activeStepIndex > stepNum;
          const isCurrent = activeStepIndex === stepNum;

          return (
            <div key={step.id} className="col-3 px-1">
              <span
                className={`d-block fw-semibold lh-sm ${
                  isCurrent ? 'text-primary' : isDone ? 'text-text' : 'text-muted'
                }`}
                style={{ fontSize: '0.76rem' }}
              >
                {step.title}
              </span>
              <span
                className="text-muted d-none d-sm-block mt-1 lh-xs"
                style={{ fontSize: '0.66rem' }}
              >
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
