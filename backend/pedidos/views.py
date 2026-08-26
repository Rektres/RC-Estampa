import logging
from django.db import models
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Carrito, Cotizacion, Pedido
from .serializers import CarritoSerializer, CotizacionSerializer, PedidoSerializer
from .services.mercadopago import obtener_info_pago_mercadopago

logger = logging.getLogger(__name__)


class PedidoViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'numero'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if getattr(user, 'rol', '') == 'admin' or user.is_staff:
                return Pedido.objects.all().order_by('-creado_en')
            return Pedido.objects.filter(models.Q(user=user) | models.Q(email__iexact=user.email)).order_by('-creado_en')
        email = self.request.query_params.get('email')
        if email:
            return Pedido.objects.filter(email__iexact=email).order_by('-creado_en')
        return Pedido.objects.none()



class CotizacionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = CotizacionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Cotizacion.objects.all()


class CarritoView(generics.GenericAPIView):
    serializer_class = CarritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_carrito(self):
        carrito, _ = Carrito.objects.get_or_create(user=self.request.user)
        return carrito

    def get(self, request):
        return Response(self.get_serializer(self.get_carrito()).data)

    def put(self, request):
        serializer = self.get_serializer(self.get_carrito(), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
def mercadopago_webhook(request):
    """
    Webhook / Notificación IPN para Mercado Pago.
    Recibe notificaciones de eventos de pago y actualiza el pedido correspondiente.
    """
    try:
        data = request.data if request.method == 'POST' else {}
        topic = request.GET.get('topic') or data.get('type')
        payment_id = request.GET.get('id') or data.get('data', {}).get('id') or request.GET.get('data.id')

        logger.info(f"Webhook Mercado Pago recibido: topic={topic}, payment_id={payment_id}")

        if (topic in ('payment', 'merchant_order') or data.get('action') == 'payment.created' or data.get('action') == 'payment.updated') and payment_id:
            payment_info = obtener_info_pago_mercadopago(payment_id)
            if payment_info:
                payment_status = payment_info.get("status")
                external_ref = payment_info.get("external_reference")

                logger.info(f"Estado de pago MP {payment_id} para ref {external_ref}: {payment_status}")

                if external_ref:
                    pedido = Pedido.objects.filter(numero=external_ref).first()
                    if pedido:
                        pedido.transaccion_id = str(payment_id)
                        pedido.datos_pago_raw = payment_info

                        if payment_status == 'approved':
                            pedido.estado = 'pagado'
                            if not pedido.pagado_en:
                                pedido.pagado_en = timezone.now()
                        elif payment_status in ('rejected', 'cancelled'):
                            if pedido.estado == 'pendiente':
                                pedido.estado = 'cancelado'

                        pedido.save()
                        logger.info(f"Pedido {pedido.numero} actualizado exitosamente a estado={pedido.estado}")

        return Response({"status": "received"}, status=status.HTTP_200_OK)

    except Exception as exc:
        logger.error(f"Error procesando webhook de Mercado Pago: {exc}")
        return Response({"status": "error", "message": str(exc)}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def procesar_pago_tarjeta(request):
    """
    Endpoint para procesar pagos con tarjeta directamente en el sitio (Checkout API).
    Crea el pedido si no existe y procesa el token de tarjeta con Mercado Pago.
    """
    try:
        from .services.mercadopago_api import procesar_pago_directo_mercadopago

        data = request.data
        token = data.get('token')
        payment_method_id = data.get('payment_method_id')
        installments = data.get('installments', 1)
        issuer_id = data.get('issuer_id')
        doc_type = data.get('doc_type', 'RUT')
        doc_number = data.get('doc_number', '')
        payer_email = data.get('payer_email')
        pedido_numero = data.get('pedido_numero')
        pedido_input = data.get('pedido_data')

        if not token or not payment_method_id:
            return Response(
                {"success": False, "message": "Faltan datos de la tarjeta (token o método de pago)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Obtener o crear el pedido
        pedido = None
        if pedido_numero:
            pedido = Pedido.objects.filter(numero=pedido_numero).first()

        if not pedido and pedido_input:
            serializer = PedidoSerializer(data=pedido_input, context={'request': request})
            serializer.is_valid(raise_exception=True)
            pedido = serializer.save()

        if not pedido:
            return Response(
                {"success": False, "message": "No se pudo identificar el pedido para el cobro."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_test_card = data.get('is_test_card', False)
        card_last_digits = data.get('card_last_digits', '')

        # 2. Procesar el cobro directo en Mercado Pago API
        resultado = procesar_pago_directo_mercadopago(
            pedido=pedido,
            token=token,
            payment_method_id=payment_method_id,
            installments=installments,
            issuer_id=issuer_id,
            payer_email=payer_email,
            doc_type=doc_type,
            doc_number=doc_number,
            is_test_card=is_test_card,
            card_last_digits=card_last_digits,
        )

        resultado['pedido'] = PedidoSerializer(pedido).data
        http_code = status.HTTP_200_OK if resultado.get('success') else status.HTTP_400_BAD_REQUEST
        return Response(resultado, status=http_code)

    except Exception as exc:
        logger.error(f"Error en procesar_pago_tarjeta: {exc}")
        return Response(
            {"success": False, "message": f"Error al procesar el pago: {str(exc)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


