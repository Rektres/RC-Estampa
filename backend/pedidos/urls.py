from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CarritoView, CotizacionViewSet, PedidoViewSet, mercadopago_webhook, procesar_pago_tarjeta

router = DefaultRouter()
router.register('pedidos', PedidoViewSet, basename='pedido')
router.register('cotizaciones', CotizacionViewSet, basename='cotizacion')

urlpatterns = [
    path('carrito/', CarritoView.as_view(), name='carrito'),
    path('pagos/procesar/', procesar_pago_tarjeta, name='procesar-pago-tarjeta'),
    path('pedidos/mercadopago/webhook/', mercadopago_webhook, name='mercadopago-webhook'),
] + router.urls


