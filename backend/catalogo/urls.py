from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoriaViewSet,
    FotoClienteViewSet,
    PanelCategoriaViewSet,
    PanelProductoVajillaViewSet,
    PanelProductoViewSet,
    PanelUploadView,
    ProductoVajillaViewSet,
    ProductoViewSet,
    editor_config,
)

router = DefaultRouter()
router.register('productos', ProductoViewSet, basename='producto')
router.register('drinkware', ProductoVajillaViewSet, basename='drinkware')
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('fotos-clientes', FotoClienteViewSet, basename='foto-cliente')
router.register('panel/productos', PanelProductoViewSet, basename='panel-producto')
router.register('panel/drinkware', PanelProductoVajillaViewSet, basename='panel-drinkware')
router.register('panel/categorias', PanelCategoriaViewSet, basename='panel-categoria')

urlpatterns = [
    path('editor/', editor_config, name='editor-config'),
    path('panel/upload/', PanelUploadView.as_view(), name='panel-upload'),
] + router.urls
