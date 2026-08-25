import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LuxuryBoxCotizacion() {
  const [tipo, setTipo] = useState<'ropa' | 'drinkware' | 'ambos'>('ropa');
  const [cantidad, setCantidad] = useState('10-50');
  const navigate = useNavigate();

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/personalizado?tipo=${tipo}&cantidad=${cantidad}`);
  }

  return (
    <section className="container-xxl py-5 my-4">
      <div className="luxury-box position-relative">
        {/* Subtle ambient light */}
        <div
          className="position-absolute top-0 start-50 translate-middle-x pointer-events-none"
          style={{
            width: '600px',
            height: '250px',
            background: 'radial-gradient(ellipse at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%)',
          }}
        />

        <div className="row align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
          <div className="col-12 col-lg-6">
            <div className="eyebrow-badge mb-3">
              <span className="glyph">★</span>
              <span>COTIZADOR DE ALTA GAMA</span>
            </div>

            <h2 className="font-italiana fs-1 text-text mb-3 lh-sm">
              ¿Requieres una producción personalizada para tu marca o evento?
            </h2>

            <p className="font-montserrat text-muted lead mb-4" style={{ fontSize: '0.95rem' }}>
              Desde tirajes exclusivos de 10 unidades hasta producciones masivas corporativas. Nuestro equipo de diseño y producción optimiza cada archivo gráfico sin costo adicional.
            </p>

            <div className="d-flex flex-column gap-2 font-montserrat small text-muted">
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Asistencia técnica en separación de color y perfiles ICC</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Precios escalonados por volumen mayorista</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Respuesta en menos de 2 horas hábiles</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="p-4 p-md-5 rounded-4 bg-card border border-primary-30 shadow-xl">
              <h3 className="font-italiana fs-4 text-text mb-4 text-center">
                Configurador Rápido de Cotización
              </h3>

              <form onSubmit={handleGo} className="d-flex flex-column gap-3">
                <div>
                  <label className="font-montserrat small fw-semibold text-text mb-2 d-block">
                    Tipo de Producto:
                  </label>
                  <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {[
                      { key: 'ropa', label: 'Ropa Textil' },
                      { key: 'drinkware', label: 'Drinkware' },
                      { key: 'ambos', label: 'Pack Mixto' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setTipo(opt.key as any)}
                        className={`btn btn-sm font-montserrat fw-medium py-2 rounded-3 ${
                          tipo === opt.key ? 'btn-primary' : 'btn-secondary'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-montserrat small fw-semibold text-text mb-2 d-block">
                    Volumen Estimado:
                  </label>
                  <select
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="form-select font-montserrat small bg-elevated border-border text-text rounded-3 py-2"
                  >
                    <option value="1-10">Muestra / 1 a 10 unidades</option>
                    <option value="10-50">10 a 50 unidades (Pequeño lote)</option>
                    <option value="50-200">50 a 200 unidades (Empresas / Marcas)</option>
                    <option value="200+">Más de 200 unidades (Gran volumen)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-3 font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-2 hover-lift"
                  >
                    <Sparkles size={17} />
                    <span>Iniciar Solicitud de Cotización</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <a
                    href="https://wa.me/56944830378"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-montserrat small text-muted text-decoration-none d-inline-flex align-items-center gap-1 hover-lift"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <MessageCircle size={14} className="text-primary" />
                    <span>¿Prefieres asesoría inmediata por WhatsApp?</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
