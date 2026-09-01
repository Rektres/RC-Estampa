import os
import sys
import django

# Set environment variables for Supabase
os.environ["POSTGRES_HOST"] = "aws-0-sa-east-1.pooler.supabase.com"
os.environ["POSTGRES_PORT"] = "5432"
os.environ["POSTGRES_DB"] = "postgres"
os.environ["POSTGRES_USER"] = "postgres.pafjdawngyezbmkiblzq"
os.environ["POSTGRES_PASSWORD"] = "rcestampaprodbdpassword"
os.environ["POSTGRES_SSLMODE"] = "require"
os.environ["CONN_MAX_AGE"] = "60"
os.environ["USE_SQLITE"] = "False"

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command
from cuentas.models import User, DireccionEnvio, Favorito
from catalogo.models import Linea, Categoria, Producto, VarianteProducto, ImagenProducto, ProductoVajilla, VarianteVajilla, ImagenVajilla, ColorEditor, PrecioEditor, TallaStandard, Region
from pedidos.models import Pedido, ItemPedido, Carrito, ItemCarrito, Cotizacion
from disenos.models import Diseno

print("1. Ejecutando migraciones de Django sobre Supabase...")
call_command("migrate", interactive=False)
print(" -> Migraciones aplicadas con éxito en Supabase!")

print("\n2. Cargando datos desde fixture JSON respaldado...")
fixture_path = "backups/backup_data_20260901.json"
try:
    call_command("loaddata", fixture_path)
    print(" -> Datos cargados exitosamente con loaddata!")
except Exception as e:
    print(f" -> Error con loaddata: {e}")

print("\n3. Verificación de registros en Supabase:")
print(" - Usuarios:", User.objects.count())
print(" - Direcciones:", DireccionEnvio.objects.count())
print(" - Favoritos:", Favorito.objects.count())
print(" - Líneas:", Linea.objects.count())
print(" - Categorías:", Categoria.objects.count())
print(" - Productos Textiles:", Producto.objects.count())
print(" - Variantes Textiles:", VarianteProducto.objects.count())
print(" - Imágenes Textiles:", ImagenProducto.objects.count())
print(" - Productos Drinkware:", ProductoVajilla.objects.count())
print(" - Variantes Drinkware:", VarianteVajilla.objects.count())
print(" - Imágenes Drinkware:", ImagenVajilla.objects.count())
print(" - Pedidos:", Pedido.objects.count())
print(" - Items Pedido:", ItemPedido.objects.count())
print(" - Cotizaciones:", Cotizacion.objects.count())
print(" - Diseños Personalizados:", Diseno.objects.count())
print(" - Colores Editor:", ColorEditor.objects.count())
print(" - Precios Editor:", PrecioEditor.objects.count())
print(" - Regiones:", Region.objects.count())
print("\n¡MIGRACIÓN A SUPABASE COMPLETADA CON ÉXITO!")
