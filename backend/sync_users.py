import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from cuentas.models import User

print("Sincronizando usuarios desde el backup JSON...")
with open("backup_data_20260901.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for item in data:
    if item["model"] == "cuentas.user":
        fields = item["fields"]
        pk = item["pk"]
        email = fields["email"]
        user, created = User.objects.get_or_create(email=email, defaults={"id": pk})
        user.nombre = fields.get("nombre", "")
        user.rol = fields.get("rol", "cliente")
        user.password = fields.get("password", "")
        user.telefono = fields.get("telefono", "")
        user.rut = fields.get("rut", "")
        user.direccion = fields.get("direccion", "")
        user.comuna = fields.get("comuna", "")
        user.ciudad = fields.get("ciudad", "")
        user.region = fields.get("region", "")
        user.is_staff = fields.get("is_staff", False)
        user.is_superuser = fields.get("is_superuser", False)
        user.is_active = fields.get("is_active", True)
        user.save()
        status = "CREADO" if created else "ACTUALIZADO"
        print(f" -> Usuario {email} ({user.rol}): {status}")

print(f"\nTotal de usuarios en Supabase: {User.objects.count()}")
