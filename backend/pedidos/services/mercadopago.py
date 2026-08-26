import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def crear_preferencia_mercadopago(pedido):
    """
    Crea una preferencia de pago en Mercado Pago Checkout Pro
    y retorna la URL de pago (init_point o sandbox_init_point).
    """
    access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '').strip()
    if not access_token:
        logger.warning("MERCADOPAGO_ACCESS_TOKEN no está configurado. No se puede crear preferencia.")
        return None

    try:
        import mercadopago
        sdk = mercadopago.SDK(access_token)

        # Preparar ítems para Mercado Pago
        items = []
        for item in pedido.items.all():
            precio_unitario = float(item.precio) if item.precio and item.precio > 0 else 0
            if precio_unitario > 0:
                detalle_talla = f" - Talla: {item.talla}" if item.talla else ""
                detalle_color = f" - Color: {item.color}" if item.color else ""
                items.append({
                    "id": str(item.id),
                    "title": f"{item.nombre}{detalle_talla}{detalle_color}"[:250],
                    "quantity": int(item.cantidad),
                    "unit_price": precio_unitario,
                    "currency_id": "CLP",
                })

        # Si el total calculado difiere o hay items sin precio, usamos el total del pedido
        if not items and pedido.total > 0:
            items.append({
                "id": str(pedido.numero),
                "title": f"Pedido {pedido.numero} - RC Estampa",
                "quantity": 1,
                "unit_price": float(pedido.total),
                "currency_id": "CLP",
            })

        if not items:
            return None

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        backend_url = getattr(settings, 'BACKEND_PUBLIC_URL', 'http://localhost:8000').rstrip('/')

        # Armar payload de la preferencia
        preference_data = {
            "items": items,
            "payer": {
                "name": pedido.nombre[:100],
                "email": pedido.email,
                "phone": {
                    "number": pedido.telefono[:30] if pedido.telefono else "",
                },
                "address": {
                    "street_name": pedido.direccion[:150],
                },
            },
            "back_urls": {
                "success": f"{frontend_url}/confirmacion?status=approved&pedido_id={pedido.numero}",
                "failure": f"{frontend_url}/confirmacion?status=failure&pedido_id={pedido.numero}",
                "pending": f"{frontend_url}/confirmacion?status=pending&pedido_id={pedido.numero}",
            },
            "auto_return": "approved",
            "external_reference": str(pedido.numero),
            "statement_descriptor": "RC ESTAMPA",
            "notification_url": f"{backend_url}/api/pedidos/mercadopago/webhook/",
        }

        preference_response = sdk.preference().create(preference_data)
        res = preference_response.get("response", {})
        
        # En sandbox de MP se puede usar sandbox_init_point o init_point
        init_point = res.get("init_point") or res.get("sandbox_init_point")
        return init_point

    except Exception as exc:
        logger.error(f"Error al crear preferencia en Mercado Pago para pedido {pedido.numero}: {exc}")
        return None


def obtener_info_pago_mercadopago(payment_id):
    """
    Consulta a la API de Mercado Pago por el estado de un pago.
    """
    access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '').strip()
    if not access_token:
        return None

    try:
        import mercadopago
        sdk = mercadopago.SDK(access_token)
        payment_response = sdk.payment().get(str(payment_id))
        return payment_response.get("response")
    except Exception as exc:
        logger.error(f"Error al consultar pago {payment_id} en Mercado Pago: {exc}")
        return None
