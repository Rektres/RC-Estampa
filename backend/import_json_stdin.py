import sys
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core import serializers
from cuentas.models import User
from catalogo.models import Linea, Categoria, Producto, VarianteProducto, ImagenProducto, ProductoVajilla, VarianteVajilla, ImagenVajilla, ColorEditor, PrecioEditor, TallaStandard, Region
from pedidos.models import Pedido, ItemPedido, Carrito, ItemCarrito, Cotizacion
from disenos.models import Diseno

print("Leyendo fixture JSON desde stdin...")
json_data = sys.stdin.read()
print(f"JSON recibido: {len(json_data)} caracteres")

count = 0
for obj in serializers.deserialize("json", json_data):
    obj.save()
    count += 1

print(f"\n¡{count} OBJETOS RESTAURADOS EXITOSAMENTE EN SUPABASE!")

print("\nConteo verificado en Supabase:")
print(" - Usuarios:", User.objects.count())
print(" - Líneas:", Linea.objects.count())
print(" - Categorías:", Categoria.objects.count())
print(" - Productos Textiles:", Producto.objects.count())
print(" - Variantes Textiles:", VarianteProducto.objects.count())
print(" - Imágenes Textiles:", ImagenProducto.objects.count())
print(" - Productos Drinkware:", ProductoVajilla.objects.count())
print(" - Variantes Drinkware:", VarianteVajilla.objects.count())
print(" - Imágenes Drinkware:", ImagenVajilla.objects.count())
print(" - Colores Editor:", ColorEditor.objects.count())
print(" - Precios Editor:", PrecioEditor.objects.count())
print(" - Regiones:", Region.objects.count())
