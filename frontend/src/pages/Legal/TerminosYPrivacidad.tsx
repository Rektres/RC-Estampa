import { ShieldCheck, Lock, FileText, Scale, Eye, Mail } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';

export default function TerminosYPrivacidad() {
  useSEO({
    title: 'Términos, Condiciones y Política de Privacidad — RC Estampa',
    description:
      'Políticas de privacidad de datos personales bajo la ley chilena N° 21.719 y términos de compra de RC Estampa SpA.',
  });

  return (
    <div className="container py-5" style={{ maxWidth: '54rem' }}>
      {/* Header */}
      <div className="text-center mb-5">
        <div className="badge border border-primary-30 text-primary px-3 py-2 rounded-pill font-montserrat text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
          Marco Legal Vigente en Chile
        </div>
        <h1 className="font-italiana text-text mb-3" style={{ fontSize: '2.5rem' }}>
          Términos de Servicio & Política de Protección de Datos
        </h1>
        <p className="font-montserrat text-muted" style={{ fontSize: '0.9rem' }}>
          Conforme a la <strong>Ley N° 21.719</strong> sobre Protección de Datos Personales, <strong>Ley N° 19.628</strong> y <strong>Ley N° 19.496</strong> de Protección al Consumidor.
        </p>
        <div className="text-ghost small font-montserrat">Última actualización: Agosto 2026 — RC Estampa SpA</div>
      </div>

      <div className="bg-card border border-border rounded-4 p-4 p-md-5 d-flex flex-column gap-5 font-montserrat text-text shadow-sm" style={{ fontSize: '0.92rem', lineHeight: '1.75' }}>
        {/* Sección 1 */}
        <section>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Scale size={22} className="text-primary" />
            <h2 className="font-montserrat fw-bold text-text fs-5 mb-0">1. Identificación del Responsable del Tratamiento</h2>
          </div>
          <p className="text-muted">
            El presente sitio web y sus servicios de comercio electrónico son operados por <strong>RC Estampa SpA</strong> (en adelante, «RC Estampa»), sociedad constituida bajo las leyes de la República de Chile, con domicilio en Santiago, Región Metropolitana, Chile.
          </p>
          <p className="text-muted mb-0">
            Para efectos de consultas, ejercicio de derechos de privacidad o atención al cliente, nuestro canal oficial es el correo electrónico <a href="mailto:privacidad@rcestampa.cl" className="text-primary text-decoration-none fw-semibold">privacidad@rcestampa.cl</a> y nuestra línea WhatsApp <a href="https://wa.me/56944830378" className="text-primary text-decoration-none fw-semibold">+56 9 4483 0378</a>.
          </p>
        </section>

        {/* Sección 2 */}
        <section>
          <div className="d-flex align-items-center gap-2 mb-3">
            <ShieldCheck size={22} className="text-primary" />
            <h2 className="font-montserrat fw-bold text-text fs-5 mb-0">2. Principios y Finalidades del Tratamiento de Datos</h2>
          </div>
          <p className="text-muted">
            En estricto cumplimiento del principio de <strong>licitud, lealtad, proporcionalidad y seguridad</strong>, los datos personales recabados (nombre, RUT, correo electrónico, teléfono y dirección de despacho) son utilizados exclusivamente para:
          </p>
          <ul className="text-muted ps-3 d-flex flex-column gap-2 mb-0">
            <li><strong>Gestión de pedidos:</strong> Facturación, personalización de prendas/drinkware, empaque y despacho nacional a domicilio o sucursal.</li>
            <li><strong>Notificaciones operativas:</strong> Envío de códigos de seguridad de 6 dígitos para verificación de cuentas, confirmación de pagos y enlace de seguimiento en tiempo real.</li>
            <li><strong>Soporte técnico y posventa:</strong> Coordinación de pruebas de diseño gráfico antes de estampado y atención de requerimientos especiales.</li>
          </ul>
        </section>

        {/* Sección 3 */}
        <section>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Lock size={22} className="text-primary" />
            <h2 className="font-montserrat fw-bold text-text fs-5 mb-0">3. Seguridad de Pagos y Pasarelas Certificadas</h2>
          </div>
          <p className="text-muted">
            RC Estampa no almacena números completos de tarjetas de crédito, débito ni códigos de seguridad CVV. Todas las transacciones electrónicas se procesan a través de la infraestructura cifrada de <strong>Mercado Pago Chile</strong> bajo el estándar internacional de seguridad <strong>PCI-DSS Nivel 1</strong> y cifrado SSL de 256 bits.
          </p>
        </section>

        {/* Sección 4 */}
        <section>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Eye size={22} className="text-primary" />
            <h2 className="font-montserrat fw-bold text-text fs-5 mb-0">4. Derechos del Titular de Datos (Derechos ARCO)</h2>
          </div>
          <p className="text-muted">
            Conforme a la legislación chilena, todo usuario registrado o cliente tiene derecho a solicitar en cualquier momento y de forma gratuita:
          </p>
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <div className="p-3 bg-elevated rounded-3 border border-border">
                <strong className="text-primary d-block mb-1">Acceso & Información</strong>
                <span className="small text-muted">Conocer qué datos personales mantenemos almacenados y el origen de los mismos.</span>
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="p-3 bg-elevated rounded-3 border border-border">
                <strong className="text-primary d-block mb-1">Rectificación</strong>
                <span className="small text-muted">Actualizar o corregir información errónea directamente desde tu panel de Mi Cuenta.</span>
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="p-3 bg-elevated rounded-3 border border-border">
                <strong className="text-primary d-block mb-1">Cancelación / Supresión</strong>
                <span className="small text-muted">Solicitar la eliminación definitiva de tu cuenta y registros no tributarios.</span>
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="p-3 bg-elevated rounded-3 border border-border">
                <strong className="text-primary d-block mb-1">Oposición & Portabilidad</strong>
                <span className="small text-muted">Oponerse al tratamiento o solicitar una copia estructurada de tus datos.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5 */}
        <section>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FileText size={22} className="text-primary" />
            <h2 className="font-montserrat fw-bold text-text fs-5 mb-0">5. Políticas de Confección, Grabado & Despacho</h2>
          </div>
          <ul className="text-muted ps-3 d-flex flex-column gap-2 mb-0">
            <li><strong>Plazos de producción:</strong> Los productos personalizados con grabado láser o estampado DTF Textil requieren un tiempo estándar de producción de <strong>3 a 5 días hábiles</strong> previo a su entrega al courier.</li>
            <li><strong>Productos personalizados:</strong> Conforme al artículo 3 bis de la Ley N° 19.496, los bienes confeccionados o personalizados según especificaciones del consumidor no admiten derecho a retracto unilateral una vez iniciada la impresión, salvo fallas de fabricación imputables al taller.</li>
            <li><strong>Garantía Legal:</strong> Todo producto con defecto técnico de confección cuenta con la garantía legal de 6 meses para cambio, reparación o devolución.</li>
          </ul>
        </section>

        {/* Sección 6: Contacto */}
        <section className="bg-elevated p-4 rounded-4 border border-primary-30 text-center">
          <Mail size={28} className="text-primary mb-2 mx-auto" />
          <h3 className="font-montserrat fw-bold text-text fs-6 mb-2">Canal de Ejercicio de Derechos de Privacidad</h3>
          <p className="text-muted small mb-3">
            Para ejercer cualquiera de tus derechos ARCO o solicitar la baja de tus datos personales, puedes escribir directamente a nuestro oficial de privacidad:
          </p>
          <a href="mailto:privacidad@rcestampa.cl" className="btn btn-primary px-4 py-2 font-montserrat fw-semibold">
            Contactar a Privacidad (privacidad@rcestampa.cl)
          </a>
        </section>
      </div>
    </div>
  );
}
