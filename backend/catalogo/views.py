import uuid
from pathlib import Path

from django.core.files.storage import default_storage
from django.db.models.deletion import ProtectedError
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from cuentas.permissions import IsAdminRol

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
    ProductoVajillaWriteSerializer,
    ProductoWriteSerializer,
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


# ---------------------------------------------------------------------------
# Panel de administración (CRUD completo, solo rol admin)
# ---------------------------------------------------------------------------

class PanelProductoViewSet(viewsets.ModelViewSet):
    """CRUD de productos de ropa. Incluye inactivos (a diferencia del público)."""

    serializer_class = ProductoWriteSerializer
    permission_classes = [IsAdminRol]
    filterset_class = ProductoFilter
    ordering_fields = ['precio', 'creado_en', 'destacado']
    ordering = ['-creado_en']

    def get_queryset(self):
        return (
            Producto.objects.all()
            .select_related('categoria')
            .prefetch_related('variantes', 'imagenes')
            .distinct()
        )


class PanelProductoVajillaViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoVajillaWriteSerializer
    permission_classes = [IsAdminRol]
    filterset_class = ProductoVajillaFilter
    ordering_fields = ['precio', 'creado_en', 'destacado']
    ordering = ['-creado_en']

    def get_queryset(self):
        return (
            ProductoVajilla.objects.all()
            .select_related('categoria')
            .prefetch_related('variantes', 'imagenes')
            .distinct()
        )


class PanelCategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminRol]
    pagination_class = None

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'La categoría tiene productos asociados; reasígnalos o elimínalos primero.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PanelUploadView(APIView):
    """Sube una imagen de producto y devuelve su URL en /media/."""

    permission_classes = [IsAdminRol]
    parser_classes = [MultiPartParser]

    MAX_SIZE = 5 * 1024 * 1024
    ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'}

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'Falta el archivo (campo "file").'}, status=400)
        if file.size > self.MAX_SIZE:
            return Response({'detail': 'La imagen supera el máximo de 5MB.'}, status=400)
        ext = Path(file.name).suffix.lower()
        if ext not in self.ALLOWED_EXT:
            return Response({'detail': f'Extensión no permitida: {ext}'}, status=400)
        path = default_storage.save(f'productos/{uuid.uuid4().hex}{ext}', file)
        return Response({'url': f'/media/{path}'}, status=201)


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
