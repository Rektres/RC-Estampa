from rest_framework import generics, mixins, permissions, viewsets
from rest_framework.response import Response

from .models import Carrito, Cotizacion, Pedido
from .serializers import CarritoSerializer, CotizacionSerializer, PedidoSerializer


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
