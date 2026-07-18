from django.db import models

LINEAS = (('urbana', 'Urbana'), ('formal', 'Formal'), ('drinkware', 'Drinkware'))


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    linea = models.CharField(max_length=10, choices=LINEAS, blank=True)

    class Meta:
        verbose_name_plural = 'categorias'

    def __str__(self):
        return self.nombre


class ProductoBase(models.Model):
    nombre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    descripcion = models.TextField(blank=True)
    precio = models.PositiveIntegerField()
    precio_oferta = models.PositiveIntegerField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    destacado = models.BooleanField(default=False)
    nuevo = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ('-creado_en',)

    def __str__(self):
        return self.nombre


class Producto(ProductoBase):
    linea = models.CharField(max_length=10, choices=LINEAS)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='productos')


class VarianteProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='variantes')
    talla = models.CharField(max_length=10)
    color = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=9)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.sku


class ImagenProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='imagenes')
    # CharField (no URLField): acepta URLs externas y rutas /media/productos/...
    imagen = models.CharField(max_length=500)
    es_principal = models.BooleanField(default=False)
    es_frente = models.BooleanField(default=False)
    es_reverso = models.BooleanField(default=False)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('orden',)


class ProductoVajilla(ProductoBase):
    material = models.CharField(max_length=100)
    capacidad_ml = models.PositiveIntegerField(null=True, blank=True)
    linea = models.CharField(max_length=10, default='drinkware')
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='vajilla')


class VarianteVajilla(models.Model):
    producto = models.ForeignKey(ProductoVajilla, on_delete=models.CASCADE, related_name='variantes')
    color = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=9)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.sku


class ImagenVajilla(models.Model):
    producto = models.ForeignKey(ProductoVajilla, on_delete=models.CASCADE, related_name='imagenes')
    imagen = models.CharField(max_length=500)
    es_principal = models.BooleanField(default=False)
    es_frente = models.BooleanField(default=False)
    es_reverso = models.BooleanField(default=False)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('orden',)


class FotoCliente(models.Model):
    TIPOS = (('ropa', 'Ropa'), ('vajilla', 'Vajilla'))

    imagen = models.URLField(max_length=500)
    tipo = models.CharField(max_length=10, choices=TIPOS)
    texto_review = models.TextField(blank=True)
    nombre_cliente = models.CharField(max_length=150, blank=True)
    producto_ropa_slug = models.CharField(max_length=220, blank=True)
    producto_vajilla_slug = models.CharField(max_length=220, blank=True)

    def __str__(self):
        return f'{self.nombre_cliente or "Foto"} ({self.tipo})'


class ColorEditor(models.Model):
    nombre = models.CharField(max_length=50)
    hex = models.CharField(max_length=9, unique=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('orden',)

    def __str__(self):
        return self.nombre


class PrecioEditor(models.Model):
    producto_key = models.CharField(max_length=30, unique=True)
    precio = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.producto_key}: {self.precio}'


class TallaStandard(models.Model):
    nombre = models.CharField(max_length=10, unique=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('orden',)

    def __str__(self):
        return self.nombre


class Region(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('orden',)

    def __str__(self):
        return self.nombre
