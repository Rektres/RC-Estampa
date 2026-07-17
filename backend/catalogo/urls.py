from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoriaViewSet,
    FotoClienteViewSet,
    ProductoVajillaViewSet,
    ProductoViewSet,
    editor_config,
)

router = DefaultRouter()
router.register('productos', ProductoViewSet, basename='producto')
router.register('drinkware', ProductoVajillaViewSet, basename='drinkware')
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('fotos-clientes', FotoClienteViewSet, basename='foto-cliente')

urlpatterns = [
    path('editor/', editor_config, name='editor-config'),
] + router.urls
