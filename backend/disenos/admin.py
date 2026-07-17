from django.contrib import admin

from .models import Diseno


@admin.register(Diseno)
class DisenoAdmin(admin.ModelAdmin):
    list_display = ('id', 'prenda', 'talla', 'user', 'creado_en')
    list_filter = ('prenda', 'creado_en')
