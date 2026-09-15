import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

WHATSAPP_NUMERO = "+56 9 7441 9828"
WHATSAPP_LINK = "https://wa.me/56974419828"


def formatear_precio(valor):
    if not valor:
        return "$0"
    return f"${int(valor):,}".replace(",", ".")


def _plantilla_base_light(titulo_pre, titulo_principal, contenido_central, boton_texto=None, boton_url=None, nota_pie=None):
    """
    Plantilla base HTML unificada con los tokens de diseño Light oficial de RC Estampa:
    - Fondo: Alabastro cálido (#faf8f5)
    - Contenedor: Blanco puro (#ffffff) con borde sutil (rgba(18, 19, 36, 0.08))
    - Tipografía: Títulos en Italiana/Serif (#121324) y textos en Montserrat (#585a6f)
    - Acentos: Oro RC Estampa (#b8933d)
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')
    
    boton_html = ""
    if boton_texto and boton_url:
        boton_html = f"""
        <div style="text-align: center; margin: 30px 0 16px 0;">
            <a href="{boton_url}" style="display: inline-block; background: linear-gradient(135deg, #dfb755 0%, #c9a84c 60%, #a8873a 100%); color: #ffffff !important; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; box-shadow: 0 4px 14px rgba(184, 147, 61, 0.3); border: 1px solid rgba(184, 147, 61, 0.4);">
                {boton_texto}
            </a>
        </div>
        """

    nota_pie_html = ""
    if nota_pie:
        nota_pie_html = f"""
        <div style="background-color: #f3efe6; border-radius: 10px; padding: 14px 18px; text-align: center; margin-top: 24px; font-size: 12px; color: #585a6f; border: 1px solid rgba(18, 19, 36, 0.06);">
            {nota_pie}
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #faf8f5;
                color: #121324;
                margin: 0;
                padding: 24px 12px;
                -webkit-font-smoothing: antialiased;
            }}
            .wrapper {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                border: 1px solid rgba(18, 19, 36, 0.08);
                padding: 36px 28px;
                box-shadow: 0 10px 28px rgba(18, 19, 36, 0.05);
            }}
            .header {{
                text-align: center;
                border-bottom: 1px solid rgba(18, 19, 36, 0.08);
                padding-bottom: 20px;
                margin-bottom: 26px;
            }}
            .logo-title {{
                font-family: 'Italiana', 'Georgia', serif;
                font-size: 30px;
                font-weight: 700;
                color: #121324;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 0;
                line-height: 1.1;
            }}
            .logo-title span {{
                color: #b8933d;
            }}
            .logo-sub {{
                font-size: 10px;
                color: #8f91a5;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-top: 5px;
                font-weight: 700;
            }}
            .eyebrow-badge {{
                display: inline-block;
                background-color: rgba(184, 147, 61, 0.1);
                color: #8c6e28;
                border: 1px solid rgba(184, 147, 61, 0.35);
                padding: 4px 14px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                margin-bottom: 14px;
            }}
            .main-title {{
                font-family: 'Italiana', 'Georgia', serif;
                color: #121324;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 10px 0;
                line-height: 1.25;
                text-align: center;
            }}
            .content-box {{
                color: #585a6f;
                font-size: 14px;
                line-height: 1.6;
            }}
            .footer {{
                text-align: center;
                border-top: 1px solid rgba(18, 19, 36, 0.08);
                margin-top: 32px;
                padding-top: 22px;
                color: #8f91a5;
                font-size: 12px;
                line-height: 1.6;
            }}
            .footer a {{
                color: #b8933d;
                text-decoration: none;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <div class="logo-title">RC <span>ESTAMPA</span></div>
                <div class="logo-sub">Grabados & Estampados &bull; Luxury E-Commerce</div>
            </div>

            <div style="text-align: center;">
                <span class="eyebrow-badge">{titulo_pre}</span>
                <h1 class="main-title">{titulo_principal}</h1>
            </div>

            <div class="content-box">
                {contenido_central}
            </div>

            {boton_html}

            {nota_pie_html}

            <div class="footer">
                <p style="margin: 0;"><strong>RC Estampa SpA</strong> &bull; Santiago de Chile</p>
                <p style="margin: 4px 0 0 0;"><a href="{frontend_url}">{frontend_url.replace('https://', '')}</a> &bull; WhatsApp: <a href="{WHATSAPP_LINK}">{WHATSAPP_NUMERO}</a></p>
            </div>
        </div>
    </body>
    </html>
    """


def enviar_email_codigo_verificacion(user, codigo):
    """
    Envía correo HTML desde no-reply@rcestampa.cl con el código de 6 dígitos
    e instrucciones claras para activar la nueva cuenta.
    """
    try:
        destinatario = user.email
        if not destinatario:
            return False

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')
        url_auth = f"{frontend_url}/auth"

        asunto = f"🔑 {codigo} es tu código de activación — RC Estampa"

        contenido = f"""
        <p style="text-align: center; font-size: 15px; margin-bottom: 24px;">
            Hola <strong>{user.nombre or user.email}</strong>, gracias por registrarte en nuestra plataforma.
        </p>

        <div style="background: linear-gradient(135deg, #ffffff 0%, #f7f4ed 100%); border: 1px solid rgba(184, 147, 61, 0.35); border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
            <span style="font-size: 11px; font-weight: 700; color: #8c6e28; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">Código de Seguridad</span>
            <div style="font-family: monospace; font-size: 36px; font-weight: 800; color: #121324; letter-spacing: 8px; margin: 6px 0;">
                {codigo}
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #8f91a5;">Válido por 15 minutos</p>
        </div>

        <div style="background-color: #faf8f5; border-radius: 10px; border: 1px solid rgba(18, 19, 36, 0.08); padding: 18px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #121324; font-size: 14px; font-weight: 700;">Instrucciones para activar tu cuenta:</h4>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #585a6f; line-height: 1.6;">
                <li>Regresa a la pantalla de verificación en tu navegador o haz clic en el botón inferior.</li>
                <li>Ingresa el código numérico de 6 dígitos mostrado arriba.</li>
                <li>¡Listo! Tu cuenta quedará activa para guardar tus diseños 3D y hacer pedidos.</li>
            </ol>
        </div>
        """

        html_content = _plantilla_base_light(
            titulo_pre="✦ Verificación de Cuenta",
            titulo_principal="Activa tu cuenta en RC Estampa",
            contenido_central=contenido,
            boton_texto="Completar Activación en la Web",
            boton_url=url_auth,
            nota_pie="Si tú no solicitaste crear esta cuenta, puedes desestimar este mensaje con total seguridad."
        )

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'SERVER_EMAIL', 'RC Estampa <no-reply@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Código de verificación enviado desde no-reply a {destinatario}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar código de verificación a {user.email}: {exc}")
        return False


def enviar_email_cambio_estado(pedido, nuevo_estado, nota=""):
    """
    Envía correo HTML desde no-reply@rcestampa.cl al cliente cuando su pedido
    cambia de estado en taller (Confección, Despachado, Entregado, etc.).
    """
    try:
        destinatario = pedido.email
        if not destinatario:
            return False

        ESTADOS_MAP = {
            'pendiente': ('Pendiente de Pago', 'Tu orden ha sido registrada y está a la espera de pago.'),
            'pagado': ('Pago Aprobado', 'Tu pago fue confirmado y tu orden ingresó a la cola de taller.'),
            'en_proceso': ('En Confección / Taller', 'Tus piezas están siendo confeccionadas con estampados DTF Ultra HD y grabado láser.'),
            'enviado': ('Despachado en Camino', 'Tu pedido ya fue entregado al courier y va en camino a tu domicilio.'),
            'entregado': ('Pedido Entregado', 'Tu orden ha sido entregada a conformidad. ¡Esperamos que disfrutes tus productos!'),
            'cancelado': ('Cancelado / Anulado', 'Tu orden fue anulada o cancelada.'),
        }

        titulo_estado, desc_estado = ESTADOS_MAP.get(
            nuevo_estado, (nuevo_estado.upper(), 'Tu pedido ha sido actualizado.')
        )

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')
        url_seguimiento = f"{frontend_url}/perfil?tab=pedidos"

        asunto = f"📦 Actualización de Pedido #{pedido.numero}: {titulo_estado} — RC Estampa"

        nota_taller_html = ""
        if nota:
            nota_taller_html = f"""
            <div style="background-color: #f3efe6; border-left: 3px solid #b8933d; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <strong style="color: #121324; font-size: 13px;">Nota de Taller:</strong>
                <p style="margin: 4px 0 0 0; color: #585a6f; font-size: 13px;">{nota}</p>
            </div>
            """

        contenido = f"""
        <p style="text-align: center; font-size: 15px; margin-bottom: 20px;">
            Hola <strong>{pedido.nombre}</strong>, tenemos una actualización sobre tu orden:
        </p>

        <div style="background: linear-gradient(135deg, #ffffff 0%, #f7f4ed 100%); border: 1px solid rgba(184, 147, 61, 0.35); border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
            <span style="display: inline-block; background: rgba(184, 147, 61, 0.12); color: #8c6e28; border: 1px solid rgba(184, 147, 61, 0.35); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                ESTADO ACTUAL: {titulo_estado.upper()}
            </span>
            <h3 style="font-family: 'Italiana', Georgia, serif; color: #121324; margin: 10px 0 4px 0; font-size: 20px;">Orden #{pedido.numero}</h3>
            <p style="margin: 0; color: #585a6f; font-size: 14px;">{desc_estado}</p>
        </div>

        {nota_taller_html}

        <div style="background-color: #faf8f5; border-radius: 10px; border: 1px solid rgba(18, 19, 36, 0.08); padding: 16px; margin: 18px 0; font-size: 13px;">
            <p style="margin: 0 0 6px 0; color: #121324; font-weight: 700;">Datos de Entrega:</p>
            <p style="margin: 0; color: #585a6f;">📍 {pedido.direccion}, {pedido.ciudad} ({pedido.region})</p>
        </div>
        """

        html_content = _plantilla_base_light(
            titulo_pre="✦ Estado de Pedido",
            titulo_principal=f"Tu Pedido #{pedido.numero} está {titulo_estado}",
            contenido_central=contenido,
            boton_texto="Ver Línea de Tiempo en Vivo",
            boton_url=url_seguimiento,
            nota_pie="Puedes consultar el avance de tu producción en cualquier momento desde tu panel de cliente."
        )

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'SERVER_EMAIL', 'RC Estampa <no-reply@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Email de cambio de estado ({nuevo_estado}) enviado desde no-reply a {destinatario} para pedido {pedido.numero}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar email de cambio de estado para pedido {pedido.numero}: {exc}")
        return False


def enviar_email_confirmacion_pedido(pedido):
    """
    Envía correo HTML de confirmación de compra con desglose de productos en tono light.
    """
    try:
        destinatario = pedido.email
        if not destinatario:
            return False

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')
        url_seguimiento = f"{frontend_url}/perfil?tab=pedidos"

        asunto = f"🎉 ¡Pedido #{pedido.numero} Confirmado! — RC Estampa"

        filas_items_html = ""
        for item in pedido.items.all():
            detalles = []
            if item.talla:
                detalles.append(f"Talla: {item.talla}")
            if item.color:
                detalles.append(f"Color: {item.color}")
            if item.prenda:
                detalles.append(f"Prenda: {item.prenda}")
            detalle_str = " | ".join(detalles)

            precio_str = formatear_precio(item.precio * item.cantidad) if item.precio else "A cotizar"
            filas_items_html += f"""
            <tr style="border-bottom: 1px solid rgba(18, 19, 36, 0.08);">
                <td style="padding: 12px 0; color: #121324; font-size: 14px;">
                    <strong>{item.nombre}</strong><br/>
                    <span style="color: #8f91a5; font-size: 12px;">{detalle_str} &times; {item.cantidad}</span>
                </td>
                <td style="padding: 12px 0; text-align: right; color: #b8933d; font-weight: bold; font-size: 14px;">
                    {precio_str}
                </td>
            </tr>
            """

        contenido = f"""
        <p style="text-align: center; font-size: 15px; margin-bottom: 20px;">
            ¡Gracias por tu compra, <strong>{pedido.nombre}</strong>! Tu orden ha ingresado a nuestra cola de producción en taller.
        </p>

        <div style="background-color: #faf8f5; border-radius: 12px; border: 1px solid rgba(18, 19, 36, 0.08); padding: 18px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #121324; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Tiempos de Producción & Despacho
            </h4>
            <p style="margin: 4px 0; font-size: 13px; color: #585a6f;">
                ⏱️ <strong>Confección y estampado:</strong> 3 a 5 días hábiles.
            </p>
            <p style="margin: 4px 0; font-size: 13px; color: #585a6f;">
                📦 <strong>Despacho:</strong> A todo Chile con número de seguimiento.
            </p>
            <p style="margin: 4px 0; font-size: 13px; color: #585a6f;">
                📍 <strong>Destino:</strong> {pedido.direccion}, {pedido.ciudad} ({pedido.region}).
            </p>
        </div>

        <h4 style="margin: 24px 0 8px 0; color: #121324; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            Resumen de Productos
        </h4>
        <table style="width: 100%; border-collapse: collapse;">
            {filas_items_html}
            <tr>
                <td style="padding: 16px 0; font-size: 15px; color: #121324; font-weight: bold;">Total Pagado</td>
                <td style="padding: 16px 0; text-align: right; font-size: 18px; color: #b8933d; font-weight: bold;">
                    {formatear_precio(pedido.total)}
                </td>
            </tr>
        </table>
        """

        html_content = _plantilla_base_light(
            titulo_pre="✦ Pago & Pedido Aprobado",
            titulo_principal=f"¡Gracias por tu compra, {pedido.nombre}!",
            contenido_central=contenido,
            boton_texto="Ver Seguimiento de mi Pedido",
            boton_url=url_seguimiento,
            nota_pie=f"Si tienes dudas sobre tu diseño o archivos cargados, contáctanos por WhatsApp al {WHATSAPP_NUMERO}."
        )

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'RC Estampa <contacto@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Email de confirmación de pedido {pedido.numero} enviado a {destinatario}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar email de confirmación para pedido {pedido.numero}: {exc}")
        return False


def enviar_email_nuevo_pedido_admin(pedido):
    """
    Notifica al equipo de administración cuando ingresa una nueva compra confirmada.
    """
    try:
        destinatario = getattr(settings, 'ADMIN_EMAIL_NOTIFICATION', 'admin@rcestampa.cl')
        asunto = f"🚨 ¡Nueva Venta #{pedido.numero}! — Total: {formatear_precio(pedido.total)}"

        contenido = f"""
        <div style="background-color: #faf8f5; border-radius: 12px; border: 1px solid rgba(18, 19, 36, 0.08); padding: 18px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 6px 0; color: #121324;"><strong>Cliente:</strong> {pedido.nombre}</p>
            <p style="margin: 6px 0; color: #121324;"><strong>Email:</strong> {pedido.email}</p>
            <p style="margin: 6px 0; color: #121324;"><strong>Teléfono:</strong> {pedido.telefono or 'No registrado'}</p>
            <p style="margin: 6px 0; color: #b8933d; font-size: 16px; font-weight: bold;"><strong>Total:</strong> {formatear_precio(pedido.total)}</p>
            <p style="margin: 6px 0; color: #121324;"><strong>Método de Pago:</strong> {pedido.payment_method_id or 'Mercado Pago'}</p>
            <p style="margin: 6px 0; color: #121324;"><strong>Dirección:</strong> {pedido.direccion}, {pedido.ciudad} ({pedido.region})</p>
        </div>
        """

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')
        url_panel = f"{frontend_url}/panel"

        html_content = _plantilla_base_light(
            titulo_pre="✦ Alerta de Venta",
            titulo_principal=f"Nueva Orden #{pedido.numero}",
            contenido_central=contenido,
            boton_texto="Ir al Panel de Administración",
            boton_url=url_panel
        )

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'SERVER_EMAIL', 'RC Estampa <no-reply@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Notificación de nuevo pedido {pedido.numero} enviada a admin ({destinatario})")
        return True
    except Exception as exc:
        logger.error(f"Error al enviar notificación a admin para pedido {pedido.numero}: {exc}")
        return False


def enviar_email_personalizado(remitente, destinatario, asunto, mensaje, es_html=True, titulo_pre="Mensaje Oficial"):
    """
    Envía un correo personalizado desde el Panel de Administración usando la plantilla Light oficial.
    """
    try:
        if not remitente:
            remitente = "RC Estampa <contacto@rcestampa.cl>"
        elif "<" not in remitente:
            remitente = f"RC Estampa <{remitente}>"

        if es_html:
            contenido = f"""
            <div style="font-size: 14px; line-height: 1.7; color: #585a6f;">
                {mensaje.replace(chr(10), '<br/>')}
            </div>
            """
        else:
            contenido = f"""
            <p style="font-size: 14px; line-height: 1.7; color: #585a6f; white-space: pre-wrap;">
                {mensaje}
            </p>
            """

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://rcestampa.cl').rstrip('/')

        html_content = _plantilla_base_light(
            titulo_pre=f"✦ {titulo_pre}",
            titulo_principal=asunto,
            contenido_central=contenido,
            boton_texto="Visitar Tienda Online",
            boton_url=frontend_url
        )

        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(asunto, text_content, remitente, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Correo personalizado enviado exitosamente a {destinatario} desde {remitente}")
        return True
    except Exception as exc:
        logger.error(f"Error al enviar correo personalizado a {destinatario}: {exc}")
        raise exc



