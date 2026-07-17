from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Producto, ProductoVajilla


class CharCSVFilter(filters.BaseInFilter, filters.CharFilter):
    """Accepts a comma-separated list, e.g. ?talla=S,M,L"""


class ProductoFilter(filters.FilterSet):
    linea = filters.CharFilter(field_name='linea', lookup_expr='iexact')
    categoria = CharCSVFilter(field_name='categoria__slug', lookup_expr='in')
    talla = CharCSVFilter(field_name='variantes__talla', lookup_expr='in')
    color = CharCSVFilter(field_name='variantes__color', lookup_expr='in')
    precio_max = filters.NumberFilter(field_name='precio', lookup_expr='lte')
    q = filters.CharFilter(method='filter_q')

    class Meta:
        model = Producto
        fields = ['linea', 'categoria', 'talla', 'color', 'precio_max', 'q']

    def filter_q(self, queryset, name, value):
        return queryset.filter(
            Q(nombre__icontains=value) | Q(descripcion__icontains=value)
        )


class ProductoVajillaFilter(filters.FilterSet):
    categoria = CharCSVFilter(field_name='categoria__slug', lookup_expr='in')
    color = CharCSVFilter(field_name='variantes__color', lookup_expr='in')
    material = CharCSVFilter(field_name='material', lookup_expr='in')
    precio_max = filters.NumberFilter(field_name='precio', lookup_expr='lte')
    q = filters.CharFilter(method='filter_q')

    class Meta:
        model = ProductoVajilla
        fields = ['categoria', 'color', 'material', 'precio_max', 'q']

    def filter_q(self, queryset, name, value):
        return queryset.filter(
            Q(nombre__icontains=value) | Q(descripcion__icontains=value)
        )
