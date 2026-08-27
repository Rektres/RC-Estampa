import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def formatear_precio(valor):
    if not valor:
        return "$0"
    return f"${int(valor):,}".replace(",", ".")


def enviar_email_confirmacion_pedido(pedido):
    """
    Envía correo HTML de confirmación de compra con desglose de productos,
    tiempos de producción y enlace de seguimiento.
    """
    try:
        destinatario = pedido.email
        if not destinatario:
            return False

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        url_seguimiento = f"{frontend_url}/mi-cuenta?tab=pedidos"

        asunto = f"¡Tu pedido {pedido.numero} está confirmado! — RC Estampa"

        # Construir filas de productos HTML
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
            <tr style="border-bottom: 1px solid #2a2a30;">
                <td style="padding: 12px 0; color: #ffffff; font-size: 14px;">
                    <strong>{item.nombre}</strong><br/>
                    <span style="color: #a0a0a8; font-size: 12px;">{detalle_str} &times; {item.cantidad}</span>
                </td>
                <td style="padding: 12px 0; text-align: right; color: #d4af37; font-weight: bold; font-size: 14px;">
                    {precio_str}
                </td>
            </tr>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0f; color: #e5e5e8; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #16161a; border-radius: 12px; border: 1px solid #2a2a30; padding: 32px; }}
                .header {{ text-align: center; margin-bottom: 28px; border-bottom: 1px solid #2a2a30; padding-bottom: 20px; }}
                .logo-text {{ font-size: 26px; font-weight: bold; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin: 0; }}
                .tagline {{ font-size: 11px; color: #a0a0a8; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }}
                .badge-success {{ display: inline-block; background-color: rgba(212, 175, 55, 0.15); color: #d4af37; border: 1px solid #d4af37; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 16px 0; }}
                .box-info {{ background-color: #1f1f26; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #2e2e38; }}
                .btn {{ display: inline-block; background: #d4af37; color: #0d0d0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 20px; }}
                .footer {{ text-align: center; color: #6e6e78; font-size: 12px; margin-top: 32px; border-top: 1px solid #2a2a30; padding-top: 18px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-text">RC ESTAMPA</div>
                    <div class="tagline">Grabados & Estampados</div>
                </div>

                <div style="text-align: center;">
                    <span class="badge-success">&#10003; PAGO Y PEDIDO CONFIRMADOS</span>
                    <h2 style="color: #ffffff; margin-top: 10px; font-size: 22px;">¡Gracias por tu compra, {pedido.nombre}!</h2>
                    <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6;">
                        Tu orden <strong>{pedido.numero}</strong> ha ingresado a nuestra cola de producción en taller.
                    </p>
                </div>

                <div class="box-info">
                    <h3 style="color: #ffffff; font-size: 15px; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Tiempos Estimados & Despacho
                    </h3>
                    <p style="margin: 4px 0; font-size: 13px; color: #d0d0d8;">
                        &#128338; <strong>Producción y grabado:</strong> 3 a 5 días hábiles.
                    </p>
                    <p style="margin: 4px 0; font-size: 13px; color: #d0d0d8;">
                        &#128230; <strong>Despacho:</strong> A todo Chile con número de seguimiento.
                    </p>
                    <p style="margin: 4px 0; font-size: 13px; color: #d0d0d8;">
                        &#128205; <strong>Dirección de entrega:</strong> {pedido.direccion}, {pedido.ciudad} ({pedido.region}).
                    </p>
                </div>

                <h3 style="color: #ffffff; font-size: 15px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                    Resumen de Productos
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    {filas_items_html}
                    <tr>
                        <td style="padding: 16px 0; font-size: 16px; color: #ffffff; font-weight: bold;">Total Pagado</td>
                        <td style="padding: 16px 0; text-align: right; font-size: 18px; color: #d4af37; font-weight: bold;">
                            {formatear_precio(pedido.total)}
                        </td>
                    </tr>
                </table>

                <div style="text-align: center;">
                    <a href="{url_seguimiento}" class="btn">Ver Seguimiento de mi Pedido</a>
                </div>

                <div class="footer">
                    <p style="margin: 0;">RC Estampa SpA — Grabados Láser, Serigrafía & DTF Textil Ultra HD</p>
                    <p style="margin: 6px 0 0 0;">WhatsApp de Asistencia: +56 9 4483 0378 | Santiago de Chile</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'RC Estampa <contacto@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Email de confirmación enviado exitosamente para pedido {pedido.numero} a {destinatario}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar email de confirmación para pedido {pedido.numero}: {exc}")
        return False


def enviar_email_codigo_verificacion(user, codigo):
    """
    Envía correo HTML con el código de 6 dígitos para verificar la cuenta.
    """
    try:
        destinatario = user.email
        if not destinatario:
            return False

        asunto = f"{codigo} es tu código de verificación — RC Estampa"

        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0f; color: #e5e5e8; margin: 0; padding: 20px; }}
                .container {{ max-width: 520px; margin: 0 auto; background-color: #16161a; border-radius: 12px; border: 1px solid #2a2a30; padding: 32px; text-align: center; }}
                .logo-text {{ font-size: 24px; font-weight: bold; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin: 0; }}
                .tagline {{ font-size: 11px; color: #a0a0a8; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }}
                .code-box {{ display: inline-block; background-color: #1f1f26; border: 2px solid #d4af37; border-radius: 10px; padding: 14px 28px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d4af37; margin: 24px 0; font-family: monospace; }}
                .footer {{ color: #6e6e78; font-size: 12px; margin-top: 28px; border-top: 1px solid #2a2a30; padding-top: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo-text">RC ESTAMPA</div>
                <div class="tagline">Grabados & Estampados</div>

                <h2 style="color: #ffffff; margin-top: 24px; font-size: 20px;">Verifica tu cuenta</h2>
                <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6;">
                    Hola <strong>{user.nombre or user.email}</strong>, ingresa el siguiente código de seguridad en la pantalla de registro para activar tu cuenta:
                </p>

                <div>
                    <div class="code-box">{codigo}</div>
                </div>

                <p style="color: #80808c; font-size: 13px;">
                    Este código es válido por <strong>15 minutos</strong>. Si tú no solicitaste este registro, puedes ignorar este mensaje.
                </p>

                <div class="footer">
                    <p style="margin: 0;">RC Estampa SpA — Seguridad & Protección de Datos Personales</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'RC Estampa <contacto@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Código de verificación enviado exitosamente a {destinatario}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar código de verificación a {user.email}: {exc}")
        return False


def enviar_email_cambio_estado(pedido, nuevo_estado, nota=""):
    """
    Envía correo HTML al cliente cuando su pedido cambia de estado
    (ej. Pago Aprobado -> En Confección -> Despachado -> Entregado).
    """
    try:
        destinatario = pedido.email
        if not destinatario:
            return False

        ESTADOS_MAP = {
            'pendiente': ('Pendiente de Pago', 'Tu orden fue generada y está a la espera de pago.'),
            'pagado': ('Pago Aprobado', 'Tu pago ha sido validado correctamente y tu orden ingresó a la cola de producción.'),
            'en_proceso': ('En Taller / Confección', 'Tus piezas están siendo personalizadas con técnicas DTF textil / grabado láser.'),
            'enviado': ('Despachado', 'Tu pedido está en camino a tu domicilio con courier asignado.'),
            'entregado': ('Entregado', 'Tu pedido ha sido entregado a conformidad. ¡Esperamos que disfrutes tu compra!'),
            'cancelado': ('Cancelado / Anulado', 'Tu orden ha sido anulada o cancelada.'),
        }

        titulo_estado, desc_estado = ESTADOS_MAP.get(
            nuevo_estado, (nuevo_estado.upper(), 'Tu pedido ha sido actualizado.')
        )

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        url_seguimiento = f"{frontend_url}/mi-cuenta?tab=pedidos"

        asunto = f"Actualización de tu Pedido {pedido.numero}: {titulo_estado} — RC Estampa"

        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0f; color: #e5e5e8; margin: 0; padding: 20px; }}
                .container {{ max-width: 560px; margin: 0 auto; background-color: #16161a; border-radius: 12px; border: 1px solid #2a2a30; padding: 32px; }}
                .header {{ text-align: center; margin-bottom: 24px; border-bottom: 1px solid #2a2a30; padding-bottom: 16px; }}
                .logo-text {{ font-size: 24px; font-weight: bold; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin: 0; }}
                .tagline {{ font-size: 10px; color: #a0a0a8; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }}
                .badge-status {{ display: inline-block; background-color: rgba(212, 175, 55, 0.15); color: #d4af37; border: 1px solid #d4af37; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; margin: 16px 0; }}
                .box-info {{ background-color: #1f1f26; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #2e2e38; }}
                .btn {{ display: inline-block; background: #d4af37; color: #0d0d0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 18px; }}
                .footer {{ text-align: center; color: #6e6e78; font-size: 12px; margin-top: 28px; border-top: 1px solid #2a2a30; padding-top: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-text">RC ESTAMPA</div>
                    <div class="tagline">Grabados & Estampados</div>
                </div>

                <div style="text-align: center;">
                    <span class="badge-status">&#9679; {titulo_estado.upper()}</span>
                    <h2 style="color: #ffffff; margin-top: 8px; font-size: 20px;">Hola {pedido.nombre}, tenemos novedades</h2>
                    <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6;">
                        El estado de tu orden <strong>{pedido.numero}</strong> ha cambiado:
                    </p>
                </div>

                <div class="box-info">
                    <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                        {desc_estado}
                    </p>
                    {f'<p style="margin-top: 10px; font-size: 13px; color: #d4af37;"><strong>Nota de Taller:</strong> {nota}</p>' if nota else ''}
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #888894;">
                        Dirección de entrega: {pedido.direccion}, {pedido.ciudad} ({pedido.region})
                    </p>
                </div>

                <div style="text-align: center;">
                    <a href="{url_seguimiento}" class="btn">Ver Línea de Tiempo en Vivo</a>
                </div>

                <div class="footer">
                    <p style="margin: 0;">RC Estampa SpA — Asistencia WhatsApp: +56 9 4483 0378</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = strip_tags(html_content)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'RC Estampa <contacto@rcestampa.cl>')

        msg = EmailMultiAlternatives(asunto, text_content, from_email, [destinatario])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Email de cambio de estado ({nuevo_estado}) enviado exitosamente a {destinatario} para pedido {pedido.numero}")
        return True

    except Exception as exc:
        logger.error(f"Error al enviar email de cambio de estado para pedido {pedido.numero}: {exc}")
        return False

