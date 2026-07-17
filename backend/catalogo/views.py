from rest_framework import mixins, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .filters import ProductoFilter, ProductoVajillaFilter
from .models import (
    Categoria,
    ColorEditor,
    FotoCliente,
    PrecioEditor,
    Producto,
    ProductoVajilla,
    Region,
    TallaStandard,
)
from .serializers import (
    CategoriaSerializer,
    ColorEditorSerializer,
    FotoClienteSerializer,
    ProductoSerializer,
    ProductoVajillaSerializer,
)


class ProductoViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = ProductoSerializer
    filterset_class = ProductoFilter
    ordering_fields = ['precio', 'creado_en', 'destacado']
    ordering = ['-creado_en']
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Producto.objects.filter(activo=True)
            .select_related('categoria')
            .prefetch_related('variantes', 'imagenes')
            .distinct()
        )


class ProductoVajillaViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = ProductoVajillaSerializer
    filterset_class = ProductoVajillaFilter
    ordering_fields = ['precio', 'creado_en', 'destacado']
    ordering = ['-creado_en']
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            ProductoVajilla.objects.filter(activo=True)
            .select_related('categoria')
            .prefetch_related('variantes', 'imagenes')
            .distinct()
        )


class CategoriaViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    pagination_class = None


class FotoClienteViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = FotoCliente.objects.all()
    serializer_class = FotoClienteSerializer
    pagination_class = None


@api_view(['GET'])
@permission_classes([AllowAny])
def editor_config(request):
    """Colores, precios base y tallas para el editor de diseño."""
    colores = ColorEditorSerializer(ColorEditor.objects.all(), many=True).data
    precios = {p.producto_key: p.precio for p in PrecioEditor.objects.all()}
    tallas = list(TallaStandard.objects.values_list('nombre', flat=True))
    regiones = list(Region.objects.values_list('nombre', flat=True))
    return Response({
        'colores': colores,
        'precios': precios,
        'tallas': tallas,
        'regiones': regiones,
    })
