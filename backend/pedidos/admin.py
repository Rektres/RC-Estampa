from django.contrib import admin

from .models import Carrito, Cotizacion, ItemCarrito, ItemPedido, Pedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        'numero', 'nombre', 'email', 'total', 'monto_neto', 'comision_mp',
        'metodo_pago', 'payment_method_id', 'card_last_four', 'estado', 'pagado_en', 'creado_en',
    )
    list_filter = ('estado', 'metodo_pago', 'payment_method_id', 'creado_en')
    search_fields = ('numero', 'nombre', 'email', 'transaccion_id', 'authorization_code', 'card_last_four', 'cardholder_identification')
    readonly_fields = (
        'numero', 'transaccion_id', 'url_pago', 'pagado_en', 'payment_method_id',
        'payment_type_id', 'card_last_four', 'card_first_six', 'cardholder_name',
        'cardholder_identification', 'authorization_code', 'cuotas', 'monto_neto',
        'comision_mp', 'estado_detalle', 'ip_cliente', 'user_agent', 'datos_pago_raw', 'creado_en',
    )
    fieldsets = (
        ('Identificación del Pedido', {
            'fields': ('numero', 'estado', 'total', 'monto_neto', 'comision_mp', 'creado_en', 'pagado_en'),
        }),
        ('Datos del Comprador y Despacho', {
            'fields': ('user', 'nombre', 'email', 'telefono', 'direccion', 'comuna', 'ciudad', 'region', 'notas'),
        }),
        ('Auditoría de Pasarela y Tarjeta', {
            'fields': (
                'metodo_pago', 'transaccion_id', 'estado_detalle', 'payment_method_id',
                'payment_type_id', 'card_last_four', 'card_first_six', 'cardholder_name',
                'cardholder_identification', 'authorization_code', 'cuotas',
            ),
        }),
        ('Seguridad y Auditoría de Red', {
            'fields': ('ip_cliente', 'user_agent', 'datos_pago_raw'),
        }),
    )
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
