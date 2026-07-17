from rest_framework import mixins, permissions, viewsets

from .models import Diseno
from .serializers import DisenoSerializer


class DisenoViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = DisenoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Diseno.objects.all()
