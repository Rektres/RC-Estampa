import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command
from cuentas.models import User
from catalogo.models import Producto, Linea, Categoria, ProductoVajilla

print("Cargando backup_data_20260901.json en Supabase...")

# Read the fixture from file or stdin
fixture_file = "backups/backup_data_20260901.json"
if os.path.exists(fixture_file):
    call_command("loaddata", fixture_file)
else:
    print(f"Buscando {fixture_file}...")

print("\nConteo tras la carga:")
print(" - Usuarios:", User.objects.count())
print(" - Líneas:", Linea.objects.count())
print(" - Categorías:", Categoria.objects.count())
print(" - Productos Textiles:", Producto.objects.count())
print(" - Productos Drinkware:", ProductoVajilla.objects.count())
