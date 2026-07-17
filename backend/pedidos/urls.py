from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CarritoView, CotizacionViewSet, PedidoViewSet

router = DefaultRouter()
router.register('pedidos', PedidoViewSet, basename='pedido')
router.register('cotizaciones', CotizacionViewSet, basename='cotizacion')

urlpatterns = [
    path('carrito/', CarritoView.as_view(), name='carrito'),
] + router.urls
