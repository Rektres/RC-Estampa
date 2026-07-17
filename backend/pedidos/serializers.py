from rest_framework import serializers

from .models import Carrito, Cotizacion, ItemCarrito, ItemPedido, Pedido

ITEM_FIELDS = (
    'tipo', 'nombre', 'imagen', 'talla', 'color', 'prenda', 'color_base',
    'linea', 'precio', 'cantidad', 'producto_id', 'variante_id', 'diseno_id',
)


class ItemPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = ITEM_FIELDS


class PedidoSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = (
            'id', 'numero', 'nombre', 'email', 'telefono', 'direccion',
            'ciudad', 'region', 'notas', 'total', 'estado', 'creado_en', 'items',
        )
        read_only_fields = ('id', 'numero', 'estado', 'creado_en')

    def create(self, validated_data):
        items = validated_data.pop('items', [])
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        pedido = Pedido.objects.create(user=user, **validated_data)
        for item in items:
            ItemPedido.objects.create(pedido=pedido, **item)
        return pedido


class CotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cotizacion
        fields = (
            'id', 'numero', 'nombre', 'email', 'telefono', 'linea',
            'tipo_prenda', 'talla', 'descripcion', 'presupuesto_estimado',
            'estado', 'creado_en',
        )
        read_only_fields = ('id', 'numero', 'estado', 'creado_en')


class ItemCarritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCarrito
        fields = ('item_id',) + ITEM_FIELDS


class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True)

    class Meta:
        model = Carrito
        fields = ('items', 'actualizado_en')
        read_only_fields = ('actualizado_en',)

    def update(self, instance, validated_data):
        items = validated_data.get('items', [])
        instance.items.all().delete()
        for item in items:
            ItemCarrito.objects.create(carrito=instance, **item)
        instance.save()
        return instance
