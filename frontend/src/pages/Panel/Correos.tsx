import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server,
  Inbox,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { panelApi } from '../../api';

interface EmailLogItem {
  id: number;
  remitente: string;
  destinatario: string;
  asunto: string;
  mensaje: string;
  estado: string;
  error?: string;
  creado_por_email?: string;
  creado_en: string;
}

export default function Correos() {
  const [subTab, setSubTab] = useState<'redactar' | 'historial' | 'configuracion'>('redactar');

  // Formulario de envío
  const [remitente, setRemitente] = useState('contacto@rcestampa.cl');
  const [destinatario, setDestinatario] = useState('');
  const [tituloPre, setTituloPre] = useState('Mensaje Oficial');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estados de acción
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Historial
  const [historial, setHistorial] = useState<EmailLogItem[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [logSeleccionado, setLogSeleccionado] = useState<EmailLogItem | null>(null);

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const data = await panelApi.emails.history();
      setHistorial(data || []);
    } catch (err: any) {
      console.error('Error al cargar historial de correos:', err);
    } finally {
      setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinatario || !asunto || !mensaje) {
      setMensajeError('Por favor completa el destinatario, asunto y cuerpo del mensaje.');
      return;
    }

    setEnviando(true);
    setMensajeExito(null);
    setMensajeError(null);

    try {
      const res = await panelApi.emails.send({
        remitente,
        destinatario,
        asunto,
        mensaje,
        titulo_pre: tituloPre,
      });

      if (res.success) {
        setMensajeExito(`¡Correo enviado exitosamente a ${destinatario}!`);
        setDestinatario('');
        setAsunto('');
        setMensaje('');
        cargarHistorial();
      } else {
        setMensajeError(res.message || 'Error al enviar el correo.');
      }
    } catch (err: any) {
      setMensajeError(err.response?.data?.message || err.message || 'Error de conexión con el servidor SMTP.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Banner de Estado del Ecosistema de Correo */}
      <div className="luxury-box p-4 rounded-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-primary-10 text-primary border border-primary-20 flex-shrink-0">
              <Mail size={26} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="live-dot" />
                <h3 className="font-italiana fs-4 fw-bold text-text mb-0">
                  Centro de Comunicaciones & Correo Corporativo
                </h3>
              </div>
              <p className="font-montserrat small text-muted mb-0">
                Dominio oficial: <strong className="text-primary">@rcestampa.cl</strong> &bull; Entregabilidad 100% con SPF, DKIM y TLS.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 hover-lift"
            >
              <Inbox size={15} /> Abrir Bandeja Receptora (Gmail) <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Tarjetas de Métricas de Infraestructura */}
        <div className="row g-3 mt-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-3 bg-elevated border border-border">
              <span className="font-montserrat text-muted small d-block mb-1">Remitente Predeterminado</span>
              <strong className="text-text font-montserrat fs-6">contacto@rcestampa.cl</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-3 bg-elevated border border-border">
              <span className="font-montserrat text-muted small d-block mb-1">Remitente de Sistema</span>
              <strong className="text-text font-montserrat fs-6">no-reply@rcestampa.cl</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-3 bg-elevated border border-border">
              <span className="font-montserrat text-muted small d-block mb-1">Servidor Saliente (SMTP)</span>
              <strong className="text-primary font-montserrat fs-6">smtp.resend.com (TLS 587)</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-3 bg-elevated border border-border">
              <span className="font-montserrat text-muted small d-block mb-1">Bandeja de Destino (Cloudflare)</span>
              <strong className="text-text font-montserrat small">rektres.development@gmail.com</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="d-flex align-items-center gap-2 border-bottom border-border pb-2">
        <button
          onClick={() => setSubTab('redactar')}
          className={`btn btn-sm px-4 py-2 font-montserrat fw-semibold d-inline-flex align-items-center gap-2 rounded-3 ${
            subTab === 'redactar' ? 'btn-primary' : 'btn-outline-secondary border-0 text-muted'
          }`}
        >
          <Send size={15} /> Redactar Correo Oficial
        </button>
        <button
          onClick={() => {
            setSubTab('historial');
            cargarHistorial();
          }}
          className={`btn btn-sm px-4 py-2 font-montserrat fw-semibold d-inline-flex align-items-center gap-2 rounded-3 ${
            subTab === 'historial' ? 'btn-primary' : 'btn-outline-secondary border-0 text-muted'
          }`}
        >
          <Clock size={15} /> Historial de Envíos ({historial.length})
        </button>
        <button
          onClick={() => setSubTab('configuracion')}
          className={`btn btn-sm px-4 py-2 font-montserrat fw-semibold d-inline-flex align-items-center gap-2 rounded-3 ${
            subTab === 'configuracion' ? 'btn-primary' : 'btn-outline-secondary border-0 text-muted'
          }`}
        >
          <Server size={15} /> Parámetros de Conexión
        </button>
      </div>

      {/* PESTAÑA 1: REDACTAR */}
      {subTab === 'redactar' && (
        <div className="row g-4">
          {/* Formulario */}
          <div className="col-12 col-xl-7">
            <div className="stage-card p-4 rounded-4">
              <h4 className="font-montserrat fw-semibold text-text fs-6 mb-3 d-flex align-items-center gap-2">
                <FileText size={16} className="text-primary" /> Redacción de Mensaje Corporativo
              </h4>

              {mensajeExito && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              {mensajeError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{mensajeError}</span>
                </div>
              )}

              <form onSubmit={handleEnviar} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small text-muted font-montserrat mb-1">Remitente Oficial</label>
                    <select
                      value={remitente}
                      onChange={(e) => setRemitente(e.target.value)}
                      className="form-select bg-elevated"
                    >
                      <option value="contacto@rcestampa.cl">RC Estampa &lt;contacto@rcestampa.cl&gt;</option>
                      <option value="ventas@rcestampa.cl">Ventas &lt;ventas@rcestampa.cl&gt;</option>
                      <option value="pedidos@rcestampa.cl">Pedidos &lt;pedidos@rcestampa.cl&gt;</option>
                      <option value="admin@rcestampa.cl">Administración &lt;admin@rcestampa.cl&gt;</option>
                      <option value="no-reply@rcestampa.cl">Notificaciones &lt;no-reply@rcestampa.cl&gt;</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small text-muted font-montserrat mb-1">Etiqueta Superior</label>
                    <select
                      value={tituloPre}
                      onChange={(e) => setTituloPre(e.target.value)}
                      className="form-select bg-elevated"
                    >
                      <option value="Mensaje Oficial">Mensaje Oficial</option>
                      <option value="Cotización Personalizada">Cotización Personalizada</option>
                      <option value="Atención al Cliente">Atención al Cliente</option>
                      <option value="Información de Pedido">Información de Pedido</option>
                      <option value="Novedades & Promociones">Novedades & Promociones</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label small text-muted font-montserrat mb-1">
                    Destinatario (Email del Cliente) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@ejemplo.com"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    className="form-control bg-elevated"
                  />
                </div>

                <div>
                  <label className="form-label small text-muted font-montserrat mb-1">
                    Asunto del Correo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Propuesta de personalización textil para tu empresa"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="form-control bg-elevated"
                  />
                </div>

                <div>
                  <label className="form-label small text-muted font-montserrat mb-1">
                    Cuerpo del Mensaje <span className="text-danger">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Escribe aquí el contenido del mensaje. Se formateará automáticamente con la estética oficial en tono light de RC Estampa..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="form-control bg-elevated"
                  />
                </div>

                <div className="d-flex justify-content-end pt-2">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2 rounded-3 hover-lift"
                  >
                    {enviando ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Enviando por TLS...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Enviar Correo con RC Estampa</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Vista Previa en Vivo (Estilo Light Oficial) */}
          <div className="col-12 col-xl-5">
            <div className="stage-card p-4 rounded-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="font-montserrat fw-semibold text-text fs-6 mb-0 d-flex align-items-center gap-2">
                  <Eye size={16} className="text-primary" /> Vista Previa en Vivo (Plantilla Light)
                </h4>
                <span className="badge bg-primary-10 text-primary border border-primary-20 small">HTML Responsivo</span>
              </div>

              {/* Contenedor que simula el cliente de correo */}
              <div
                className="p-3 rounded-3"
                style={{
                  backgroundColor: '#faf8f5',
                  border: '1px solid rgba(18, 19, 36, 0.12)',
                  maxHeight: '480px',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid rgba(18, 19, 36, 0.08)',
                    padding: '24px 20px',
                    boxShadow: '0 4px 14px rgba(18, 19, 36, 0.04)',
                  }}
                >
                  <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(18, 19, 36, 0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
                    <div style={{ fontFamily: 'serif', fontSize: '20px', fontWeight: 'bold', color: '#121324', letterSpacing: '2px' }}>
                      RC <span style={{ color: '#b8933d' }}>ESTAMPA</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#8f91a5', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
                      Grabados & Estampados
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(184, 147, 61, 0.1)',
                        color: '#8c6e28',
                        border: '1px solid rgba(184, 147, 61, 0.35)',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                      }}
                    >
                      ✦ {tituloPre || 'Mensaje Oficial'}
                    </span>
                    <h2 style={{ fontFamily: 'serif', color: '#121324', fontSize: '17px', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                      {asunto || 'Asunto del Mensaje'}
                    </h2>
                  </div>

                  <div style={{ color: '#585a6f', fontSize: '13px', lineHeight: '1.6', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                    {mensaje || 'El texto que redactes en el formulario aparecerá aquí en tiempo real...'}
                  </div>

                  <div style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #dfb755 0%, #c9a84c 60%, #a8873a 100%)',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Visitar Tienda Online
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', borderTop: '1px solid rgba(18, 19, 36, 0.08)', marginTop: '20px', paddingTop: '14px', color: '#8f91a5', fontSize: '10px' }}>
                    <strong>RC Estampa SpA</strong> &bull; Santiago de Chile<br />
                    WhatsApp: +56 9 7441 9828 &bull; rcestampa.cl
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: HISTORIAL */}
      {subTab === 'historial' && (
        <div className="stage-card p-4 rounded-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="font-montserrat fw-semibold text-text fs-6 mb-0 d-flex align-items-center gap-2">
              <Clock size={16} className="text-primary" /> Registro de Correos Enviados ({historial.length})
            </h4>
            <button
              onClick={cargarHistorial}
              disabled={cargandoHistorial}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <RefreshCw size={13} className={cargandoHistorial ? 'spinner-border spinner-border-sm' : ''} />
              <span>Actualizar</span>
            </button>
          </div>

          {historial.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Mail size={36} className="mb-2 opacity-50 text-primary" />
              <p className="font-montserrat small mb-0">No se han registrado envíos recientes desde el panel.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 font-montserrat small">
                <thead>
                  <tr className="text-muted border-border">
                    <th>Fecha / Hora</th>
                    <th>Remitente</th>
                    <th>Destinatario</th>
                    <th>Asunto</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((log) => (
                    <tr key={log.id} className="border-border">
                      <td className="text-muted text-nowrap">
                        {new Date(log.creado_en).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="text-text fw-semibold">{log.remitente}</td>
                      <td className="text-primary">{log.destinatario}</td>
                      <td className="text-text" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.asunto}
                      </td>
                      <td>
                        {log.estado === 'enviado' ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            ✓ Entregado
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                            ✕ Fallido
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setLogSeleccionado(log)}
                          className="btn btn-outline-primary btn-sm p-1 px-2 rounded-2"
                          title="Ver detalle"
                        >
                          <Eye size={13} /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de Detalle de Correo */}
          {logSeleccionado && (
            <div
              className="modal show d-block"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-card border border-border rounded-4">
                  <div className="modal-header border-border">
                    <h5 className="modal-title font-montserrat fw-semibold text-text fs-6 d-flex align-items-center gap-2">
                      <Mail size={16} className="text-primary" /> Detalle de Correo Enviado
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setLogSeleccionado(null)}
                    />
                  </div>
                  <div className="modal-body p-4">
                    <div className="row g-3 mb-3 font-montserrat small">
                      <div className="col-sm-6">
                        <span className="text-muted d-block">De:</span>
                        <strong className="text-text">{logSeleccionado.remitente}</strong>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-muted d-block">Para:</span>
                        <strong className="text-primary">{logSeleccionado.destinatario}</strong>
                      </div>
                      <div className="col-12">
                        <span className="text-muted d-block">Asunto:</span>
                        <strong className="text-text fs-6">{logSeleccionado.asunto}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-3 bg-elevated border border-border font-montserrat text-muted small whitespace-pre-wrap">
                      {logSeleccionado.mensaje}
                    </div>

                    {logSeleccionado.error && (
                      <div className="alert alert-danger mt-3 small mb-0">
                        <strong>Error registrado:</strong> {logSeleccionado.error}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-border">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setLogSeleccionado(null)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: CONFIGURACIÓN */}
      {subTab === 'configuracion' && (
        <div className="stage-card p-4 rounded-4">
          <h4 className="font-montserrat fw-semibold text-text fs-6 mb-3 d-flex align-items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Parámetros para Conectar Clientes de Correo (Outlook, Thunderbird, Móvil)
          </h4>

          <p className="font-montserrat small text-muted mb-4">
            Utiliza estos datos oficiales para configurar tus aplicaciones locales y responder como <strong>contacto@rcestampa.cl</strong>:
          </p>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="p-4 rounded-3 bg-elevated border border-border h-100">
                <h5 className="font-montserrat fw-bold text-primary fs-6 mb-3">📤 Servidor Saliente (SMTP Relay)</h5>
                <ul className="list-unstyled font-montserrat small d-flex flex-column gap-2 mb-0">
                  <li><strong>Servidor:</strong> <code className="text-primary">smtp.resend.com</code></li>
                  <li><strong>Puerto:</strong> <code>587</code></li>
                  <li><strong>Seguridad:</strong> <code>STARTTLS</code> o <code>TLS</code></li>
                  <li><strong>Usuario SMTP:</strong> <code>resend</code></li>
                  <li><strong>Contraseña SMTP:</strong> <code className="text-warning">[Tu Resend API Key / Configurada en Servidor]</code></li>
                </ul>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="p-4 rounded-3 bg-elevated border border-border h-100">
                <h5 className="font-montserrat fw-bold text-text fs-6 mb-3">📥 Servidor Entrante (Recepción)</h5>
                <p className="small text-muted mb-3">
                  Los correos dirigidos a <strong>@rcestampa.cl</strong> son entregados por Cloudflare Email Routing directamente a tu cuenta:
                </p>
                <div className="p-3 rounded-2 bg-card border border-border text-center">
                  <span className="text-muted small d-block mb-1">Bandeja de Destino Oficial:</span>
                  <strong className="text-primary fs-6">rektres.development@gmail.com</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
