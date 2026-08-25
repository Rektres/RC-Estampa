import { Award, CheckCircle2, FileCheck } from 'lucide-react';

export default function GarantiaModulo() {
  return (
    <section className="container-xxl py-5 my-3">
      <div
        className="bg-card border border-border rounded-4 p-4 p-md-5 ribbon-accent-left position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 16, 38, 0.98) 0%, rgba(22, 24, 54, 0.92) 100%)',
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge bg-primary-20 text-primary border border-primary-30 font-montserrat fw-bold text-uppercase py-1 px-2" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                CERTIFICACIÓN TÉCNICA
              </span>
              <span className="font-montserrat small text-muted" style={{ fontSize: '0.78rem' }}>
                Estándar de Producción Textil Chilena
              </span>
            </div>

            <h3 className="font-italiana fs-2 text-white mb-3">
              Garantía de Fijación Inalterable & Certificación Textil
            </h3>

            <p className="font-montserrat text-muted small lh-base mb-4">
              Cada partida manufacturada en nuestro taller cumple con exigentes pruebas de adherencia polimérica, resistencia al frote mecánico y solidez de color frente a más de 50 ciclos de lavado doméstico. Emitimos facturación electrónica y certificados de conformidad técnica para licitaciones públicas y compras corporativas.
            </p>

            <div className="d-flex flex-wrap gap-4 font-montserrat small text-muted">
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Tintas Certificadas OEKO-TEX®</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Factura Electrónica Inmediata</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Muestras Físicas Previas a Gran Escala</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4 text-lg-end">
            <div className="d-inline-flex flex-column align-items-lg-end p-4 rounded-3 bg-elevated border border-border">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Award size={28} className="text-primary" />
                <FileCheck size={28} className="text-primary opacity-75" />
              </div>
              <span className="font-montserrat fw-bold text-text small text-uppercase" style={{ letterSpacing: '0.08em' }}>
                Sello de Excelencia RC
              </span>
              <span className="font-montserrat text-ghost" style={{ fontSize: '0.72rem' }}>
                Registro Taller ID: RC-CL-2026
              </span>
              <div className="mt-3 pt-2 border-top border-border w-100 text-lg-end">
                <span className="badge bg-primary-10 text-primary font-montserrat" style={{ fontSize: '0.68rem' }}>
                  100% GARANTIZADO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
