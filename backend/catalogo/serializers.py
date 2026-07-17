from rest_framework import serializers

from .models import (
    Categoria,
    ColorEditor,
    FotoCliente,
    ImagenProducto,
    ImagenVajilla,
    PrecioEditor,
    Producto,
    ProductoVajilla,
    Region,
    TallaStandard,
    VarianteProducto,
    VarianteVajilla,
)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'slug', 'linea')


class VarianteProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteProducto
        fields = ('id', 'talla', 'color', 'color_hex', 'stock', 'sku')


class ImagenProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = ('id', 'imagen', 'es_principal', 'es_frente', 'es_reverso', 'orden')


class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    variantes = VarianteProductoSerializer(many=True, read_only=True)
    imagenes = ImagenProductoSerializer(many=True, read_only=True)

    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'slug', 'descripcion', 'precio', 'precio_oferta',
            'activo', 'destacado', 'nuevo', 'linea', 'categoria',
            'variantes', 'imagenes',
        )


class VarianteVajillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteVajilla
        fields = ('id', 'color', 'color_hex', 'stock', 'sku')


class ImagenVajillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenVajilla
        fields = ('id', 'imagen', 'es_principal', 'es_frente', 'es_reverso', 'orden')


class ProductoVajillaSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    variantes = VarianteVajillaSerializer(many=True, read_only=True)
    imagenes = ImagenVajillaSerializer(many=True, read_only=True)

    class Meta:
        model = ProductoVajilla
        fields = (
            'id', 'nombre', 'slug', 'descripcion', 'material', 'capacidad_ml',
            'precio', 'precio_oferta', 'activo', 'destacado', 'nuevo', 'linea',
            'categoria', 'variantes', 'imagenes',
        )


class FotoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoCliente
        fields = (
            'id', 'imagen', 'tipo', 'texto_review', 'nombre_cliente',
            'producto_ropa_slug', 'producto_vajilla_slug',
        )


class ColorEditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorEditor
        fields = ('nombre', 'hex')
