import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

STATUS_DETAIL_MESSAGES = {
    'accredited': '¡Pago aprobado con éxito!',
    'pending_contingency': 'El pago está en proceso de revisión por Mercado Pago.',
    'pending_review_manual': 'El pago está siendo revisado manualmente por seguridad.',
    'cc_rejected_bad_filled_card_number': 'Revisa el número de tarjeta ingresado.',
    'cc_rejected_bad_filled_date': 'Revisa la fecha de vencimiento de tu tarjeta.',
    'cc_rejected_bad_filled_security_code': 'Revisa el código de seguridad (CVV) de la tarjeta.',
    'cc_rejected_bad_filled_other': 'Revisa los datos de la tarjeta.',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco emisor.',
    'cc_rejected_card_disabled': 'Llama a tu banco para activar tu tarjeta o usa otro medio.',
    'cc_rejected_duplicated_payment': 'Ya hiciste un pago por ese valor recientemente.',
    'cc_rejected_high_risk': 'El pago fue rechazado por políticas de prevención de fraudes.',
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta.',
    'cc_rejected_invalid_installments': 'La cantidad de cuotas seleccionada no es válida para esta tarjeta.',
    'cc_rejected_max_attempts': 'Llegaste al límite de intentos permitidos con esta tarjeta.',
    'cc_rejected_other_reason': 'El banco no procesó el pago. Intenta con otra tarjeta.',
}


def procesar_pago_directo_mercadopago(
    pedido,
    token,
    payment_method_id,
    installments=1,
    issuer_id=None,
    payer_email=None,
    doc_type='RUT',
    doc_number='',
):
    """
    Procesa un pago directo con tarjeta usando el token generado en el frontend.
    """
    access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '').strip()
    if not access_token:
        logger.warning("MERCADOPAGO_ACCESS_TOKEN no configurado.")
        return {
            'success': False,
            'status': 'rejected',
            'status_detail': 'cc_rejected_other_reason',
            'message': 'Las credenciales de pago aún no están configuradas en el servidor.',
        }

    try:
        import mercadopago
        sdk = mercadopago.SDK(access_token)

        monto_total = float(pedido.total) if pedido.total and pedido.total > 0 else 0
        if monto_total <= 0:
            return {
                'success': False,
                'status': 'rejected',
                'message': 'El monto del pedido no es válido para procesar cobro.',
            }

        backend_url = getattr(settings, 'BACKEND_PUBLIC_URL', 'http://localhost:8000').rstrip('/')

        payment_data = {
            "transaction_amount": monto_total,
            "token": str(token),
            "description": f"Compra Pedido {pedido.numero} - RC Estampa Atelier",
            "installments": int(installments) if installments else 1,
            "payment_method_id": str(payment_method_id),
            "payer": {
                "email": payer_email or pedido.email,
                "first_name": pedido.nombre.split()[0] if pedido.nombre else "",
                "last_name": " ".join(pedido.nombre.split()[1:]) if len(pedido.nombre.split()) > 1 else "",
            },
            "external_reference": str(pedido.numero),
            "statement_descriptor": "RC ESTAMPA",
            "notification_url": f"{backend_url}/api/pedidos/mercadopago/webhook/",
        }

        if issuer_id:
            payment_data["issuer_id"] = str(issuer_id)

        if doc_number:
            payment_data["payer"]["identification"] = {
                "type": doc_type or "RUT",
                "number": str(doc_number).replace(".", "").replace("-", ""),
            }

        logger.info(f"Enviando cobro a Mercado Pago para pedido {pedido.numero} por ${monto_total}")
        payment_response = sdk.payment().create(payment_data)
        res = payment_response.get("response", {})
        http_status = payment_response.get("status")

        status_code = res.get("status")
        status_detail = res.get("status_detail", "")
        payment_id = res.get("id")

        logger.info(f"Respuesta de Mercado Pago ({http_status}): status={status_code}, detail={status_detail}, id={payment_id}")

        # Guardar en base de datos
        pedido.metodo_pago = 'mercadopago'
        pedido.transaccion_id = str(payment_id) if payment_id else ''
        pedido.datos_pago_raw = res

        if status_code == 'approved':
            pedido.estado = 'pagado'
            pedido.pagado_en = timezone.now()
            pedido.save()
            return {
                'success': True,
                'status': 'approved',
                'status_detail': status_detail,
                'payment_id': payment_id,
                'message': STATUS_DETAIL_MESSAGES.get(status_detail, '¡Pago aprobado con éxito!'),
            }
        elif status_code in ('in_process', 'pending'):
            pedido.estado = 'pendiente'
            pedido.save()
            return {
                'success': True,
                'status': 'in_process',
                'status_detail': status_detail,
                'payment_id': payment_id,
                'message': STATUS_DETAIL_MESSAGES.get(status_detail, 'Tu pago está en proceso de revisión.'),
            }
        else:
            # Rechazado
            mensaje_usuario = STATUS_DETAIL_MESSAGES.get(
                status_detail,
                res.get("message") or "El pago no pudo ser procesado por el emisor."
            )
            pedido.save()
            return {
                'success': False,
                'status': status_code or 'rejected',
                'status_detail': status_detail,
                'payment_id': payment_id,
                'message': mensaje_usuario,
            }

    except Exception as exc:
        logger.error(f"Error procesando pago con Mercado Pago API: {exc}")
        return {
            'success': False,
            'status': 'error',
            'message': f'Error interno al procesar el pago: {str(exc)}',
        }
