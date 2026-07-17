from rest_framework.routers import DefaultRouter

from .views import DisenoViewSet

router = DefaultRouter()
router.register('disenos', DisenoViewSet, basename='diseno')

urlpatterns = router.urls
