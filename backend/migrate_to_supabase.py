import os
import django
import psycopg

# Connect to Supabase
print("Conectando a Supabase para migración...")
conn = psycopg.connect(
    host="db.pafjdawngyezbmkiblzq.supabase.co",
    port=5432,
    dbname="postgres",
    user="postgres",
    password="rcestampaprodbdpassword",
    sslmode="require"
)
conn.autocommit = True
cur = conn.cursor()

# Read the SQL backup file
backup_sql = "backups/backup_rcestampa_20260901.sql"
print(f"Leyendo volcado SQL desde {backup_sql}...")

with open(backup_sql, "r", encoding="utf-8") as f:
    sql_script = f.read()

print("Ejecutando restauración de tablas y datos en Supabase...")
# Execute in batches or as whole script
try:
    cur.execute(sql_script)
    print(" -> SQL RESTAURADO EXITOSAMENTE EN SUPABASE!")
except Exception as e:
    print(f" -> Advertencia/Error en ejecución SQL directo: {e}")

# Verify data
print("\nVerificando conteo de registros en Supabase:")
tablas = [
    "cuentas_user",
    "catalogo_linea",
    "catalogo_categoria",
    "catalogo_producto",
    "catalogo_varianteproducto",
    "catalogo_imagenproducto",
    "catalogo_productovajilla",
    "catalogo_variantevajilla",
    "catalogo_imagenvajilla",
    "pedidos_pedido",
    "pedidos_itempedido",
    "disenos_diseno"
]

for t in tablas:
    try:
        cur.execute(f"SELECT count(*) FROM public.{t};")
        cnt = cur.fetchone()[0]
        print(f" - {t}: {cnt} registros")
    except Exception as e:
        print(f" - {t}: ERROR ({e})")

cur.close()
conn.close()
print("\nProceso de migración a Supabase completado!")
