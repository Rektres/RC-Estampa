from django.utils.text import slugify
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
    total_productos = serializers.SerializerMethodField()

    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'slug', 'linea', 'total_productos')

    def get_total_productos(self, obj):
        count_ropa = getattr(obj, 'productos', None).count() if hasattr(obj, 'productos') else 0
        count_vajilla = getattr(obj, 'vajilla', None).count() if hasattr(obj, 'vajilla') else 0
        return count_ropa + count_vajilla


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


# ---------------------------------------------------------------------------
# Serializers de escritura (panel de administración)
# ---------------------------------------------------------------------------

def _unique_slug(model, nombre, instance=None):
    base = slugify(nombre) or 'producto'
    slug = base
    n = 2
    qs = model.objects.all()
    if instance is not None:
        qs = qs.exclude(pk=instance.pk)
    while qs.filter(slug=slug).exists():
        slug = f'{base}-{n}'
        n += 1
    return slug


class VarianteProductoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteProducto
        fields = ('talla', 'color', 'color_hex', 'stock', 'sku')
        extra_kwargs = {'sku': {'validators': []}}  # unicidad se resuelve en replace-all


class ImagenProductoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = ('imagen', 'es_principal', 'es_frente', 'es_reverso', 'orden')


class ProductoWriteSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    variantes = VarianteProductoWriteSerializer(many=True)
    imagenes = ImagenProductoWriteSerializer(many=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'slug', 'descripcion', 'precio', 'precio_oferta',
            'activo', 'destacado', 'nuevo', 'linea', 'categoria',
            'variantes', 'imagenes',
        )
        read_only_fields = ('id',)

    def validate_sku_unicidad(self, variantes, instance):
        skus = [v['sku'] for v in variantes]
        if len(skus) != len(set(skus)):
            raise serializers.ValidationError({'variantes': 'SKUs duplicados en el formulario.'})
        qs = VarianteProducto.objects.filter(sku__in=skus)
        if instance is not None:
            qs = qs.exclude(producto=instance)
        if qs.exists():
            raise serializers.ValidationError({'variantes': f'SKU ya existe en otro producto: {qs.first().sku}'})

    def _sync_nested(self, producto, variantes, imagenes):
        producto.variantes.all().delete()
        producto.imagenes.all().delete()
        for v in variantes:
            VarianteProducto.objects.create(producto=producto, **v)
        for img in imagenes:
            ImagenProducto.objects.create(producto=producto, **img)

    def create(self, validated_data):
        variantes = validated_data.pop('variantes', [])
        imagenes = validated_data.pop('imagenes', [])
        if not validated_data.get('slug'):
            validated_data['slug'] = _unique_slug(Producto, validated_data['nombre'])
        self.validate_sku_unicidad(variantes, None)
        producto = Producto.objects.create(**validated_data)
        self._sync_nested(producto, variantes, imagenes)
        return producto

    def update(self, instance, validated_data):
        variantes = validated_data.pop('variantes', None)
        imagenes = validated_data.pop('imagenes', None)
        if 'slug' in validated_data and not validated_data['slug']:
            validated_data['slug'] = _unique_slug(
                Producto, validated_data.get('nombre', instance.nombre), instance
            )
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if variantes is not None and imagenes is not None:
            self.validate_sku_unicidad(variantes, instance)
            self._sync_nested(instance, variantes, imagenes)
        return instance

    def to_representation(self, instance):
        return ProductoSerializer(instance, context=self.context).data


class VarianteVajillaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VarianteVajilla
        fields = ('color', 'color_hex', 'stock', 'sku')
        extra_kwargs = {'sku': {'validators': []}}


class ImagenVajillaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenVajilla
        fields = ('imagen', 'es_principal', 'es_frente', 'es_reverso', 'orden')


class ProductoVajillaWriteSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    variantes = VarianteVajillaWriteSerializer(many=True)
    imagenes = ImagenVajillaWriteSerializer(many=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = ProductoVajilla
        fields = (
            'id', 'nombre', 'slug', 'descripcion', 'material', 'capacidad_ml',
            'precio', 'precio_oferta', 'activo', 'destacado', 'nuevo',
            'categoria', 'variantes', 'imagenes',
        )
        read_only_fields = ('id',)

    def validate_sku_unicidad(self, variantes, instance):
        skus = [v['sku'] for v in variantes]
        if len(skus) != len(set(skus)):
            raise serializers.ValidationError({'variantes': 'SKUs duplicados en el formulario.'})
        qs = VarianteVajilla.objects.filter(sku__in=skus)
        if instance is not None:
            qs = qs.exclude(producto=instance)
        if qs.exists():
            raise serializers.ValidationError({'variantes': f'SKU ya existe en otro producto: {qs.first().sku}'})

    def _sync_nested(self, producto, variantes, imagenes):
        producto.variantes.all().delete()
        producto.imagenes.all().delete()
        for v in variantes:
            VarianteVajilla.objects.create(producto=producto, **v)
        for img in imagenes:
            ImagenVajilla.objects.create(producto=producto, **img)

    def create(self, validated_data):
        variantes = validated_data.pop('variantes', [])
        imagenes = validated_data.pop('imagenes', [])
        if not validated_data.get('slug'):
            validated_data['slug'] = _unique_slug(ProductoVajilla, validated_data['nombre'])
        self.validate_sku_unicidad(variantes, None)
        producto = ProductoVajilla.objects.create(**validated_data)
        self._sync_nested(producto, variantes, imagenes)
        return producto

    def update(self, instance, validated_data):
        variantes = validated_data.pop('variantes', None)
        imagenes = validated_data.pop('imagenes', None)
        if 'slug' in validated_data and not validated_data['slug']:
            validated_data['slug'] = _unique_slug(
                ProductoVajilla, validated_data.get('nombre', instance.nombre), instance
            )
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if variantes is not None and imagenes is not None:
            self.validate_sku_unicidad(variantes, instance)
            self._sync_nested(instance, variantes, imagenes)
        return instance

    def to_representation(self, instance):
        return ProductoVajillaSerializer(instance, context=self.context).data
