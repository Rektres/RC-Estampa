import logging
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Carrito, Cotizacion, Pedido
from .serializers import CarritoSerializer, CotizacionSerializer, PedidoSerializer
from .services.mercadopago import obtener_info_pago_mercadopago

logger = logging.getLogger(__name__)


class PedidoViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Pedido.objects.all()
    lookup_field = 'numero'


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

