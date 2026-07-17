import secrets

from django.conf import settings
from django.db import models


def _numero(prefix, digits):
    return f'{prefix}-{secrets.randbelow(10 ** digits):0{digits}d}'


class Pedido(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('en_proceso', 'En proceso'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    )

    numero = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='pedidos',
    )
    nombre = models.CharField(max_length=150)
    email = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True)
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    notas = models.TextField(blank=True)
    total = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='pendiente')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-creado_en',)

    def save(self, *args, **kwargs):
        if not self.numero:
            numero = _numero('RC', 8)
            while Pedido.objects.filter(numero=numero).exists():
                numero = _numero('RC', 8)
            self.numero = numero
        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero


class ItemPedido(models.Model):
    TIPOS = (('catalogo', 'Catálogo'), ('diseno', 'Diseño'))

    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    tipo = models.CharField(max_length=10, choices=TIPOS)
    nombre = models.CharField(max_length=200)
    imagen = models.TextField(blank=True)
    talla = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=50, blank=True)
    prenda = models.CharField(max_length=100, blank=True)
    color_base = models.CharField(max_length=20, blank=True)
    linea = models.CharField(max_length=20, blank=True)
    precio = models.PositiveIntegerField(null=True, blank=True)
    cantidad = models.PositiveIntegerField(default=1)
    producto_id = models.IntegerField(null=True, blank=True)
    variante_id = models.IntegerField(null=True, blank=True)
    diseno_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f'{self.nombre} x{self.cantidad}'


class Cotizacion(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('cotizada', 'Cotizada'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
    )

    numero = models.CharField(max_length=20, unique=True, editable=False)
    nombre = models.CharField(max_length=150)
    email = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True)
    linea = models.CharField(max_length=20)
    tipo_prenda = models.CharField(max_length=50)
    talla = models.CharField(max_length=20, blank=True)
    descripcion = models.TextField()
    presupuesto_estimado = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='pendiente')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-creado_en',)

    def save(self, *args, **kwargs):
        if not self.numero:
            numero = _numero('PER', 6)
            while Cotizacion.objects.filter(numero=numero).exists():
                numero = _numero('PER', 6)
            self.numero = numero
        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero


class Carrito(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carrito',
    )
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Carrito de {self.user}'


class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    item_id = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=200)
    imagen = models.TextField(blank=True)
    talla = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=50, blank=True)
    prenda = models.CharField(max_length=100, blank=True)
    color_base = models.CharField(max_length=20, blank=True)
    linea = models.CharField(max_length=20, blank=True)
    precio = models.PositiveIntegerField(null=True, blank=True)
    cantidad = models.PositiveIntegerField(default=1)
    producto_id = models.IntegerField(null=True, blank=True)
    variante_id = models.IntegerField(null=True, blank=True)
    diseno_id = models.IntegerField(null=True, blank=True)
