from django.contrib import admin

from .models import Carrito, Cotizacion, ItemCarrito, ItemPedido, Pedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nombre', 'email', 'total', 'estado', 'creado_en')
    list_filter = ('estado', 'creado_en')
    search_fields = ('numero', 'nombre', 'email')
    inlines = [ItemPedidoInline]


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nombre', 'email', 'tipo_prenda', 'estado', 'creado_en')
    list_filter = ('estado', 'linea', 'creado_en')
    search_fields = ('numero', 'nombre', 'email')


class ItemCarritoInline(admin.TabularInline):
    model = ItemCarrito
    extra = 0


@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ('user', 'actualizado_en')
    inlines = [ItemCarritoInline]
