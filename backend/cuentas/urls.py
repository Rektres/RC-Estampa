from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    DireccionEnvioViewSet,
    EmailTokenObtainPairView,
    FavoritoViewSet,
    MeView,
    ReenviarCodigoView,
    RegisterView,
    VerificarCodigoView,
)

router = DefaultRouter()
router.register('direcciones', DireccionEnvioViewSet, basename='direccion')
router.register('favoritos', FavoritoViewSet, basename='favorito')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verificar-codigo/', VerificarCodigoView.as_view(), name='verificar_codigo'),
    path('reenviar-codigo/', ReenviarCodigoView.as_view(), name='reenviar_codigo'),
    path('token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
] + router.urls

