import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection
from cuentas.models import User
from catalogo.models import Producto, Linea, Categoria, ProductoVajilla
from pedidos.models import Pedido

print("\n=======================================================")
print("ESTADO DEL BACKEND Y CONEXIÓN DE BASE DE DATOS:")
print(" - Engine:", connection.settings_dict['ENGINE'])
print(" - Host:", connection.settings_dict['HOST'])
print(" - Database:", connection.settings_dict['NAME'])
print(" - User:", connection.settings_dict['USER'])
print(" - SSL Options:", connection.settings_dict['OPTIONS'])
print(" - Conn Max Age:", connection.settings_dict['CONN_MAX_AGE'])
print("=======================================================")

print("\nREGISTROS ACTIVOS EN SUPABASE (POSTGRESQL CLOUD):")
print(" - Usuarios:", User.objects.count())
print(" - Líneas:", Linea.objects.count())
print(" - Categorías:", Categoria.objects.count())
print(" - Productos Textiles:", Producto.objects.count())
print(" - Productos Drinkware:", ProductoVajilla.objects.count())
print(" - Pedidos:", Pedido.objects.count())
print("=======================================================\n")
