import psycopg
import sys

print("Probando conexión directa a Supabase...")
try:
    conn = psycopg.connect(
        host="db.pafjdawngyezbmkiblzq.supabase.co",
        port=5432,
        dbname="postgres",
        user="postgres",
        password="rcestampaprodbdpassword",
        sslmode="require",
        connect_timeout=10
    )
    print(" -> CONEXIÓN EXITOSA CON SUPABASE!")
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        v = cur.fetchone()[0]
        print(f" -> Versión: {v}")
    conn.close()
except Exception as e:
    print(f" -> Error conectando a Supabase: {type(e)} {e}")
    sys.exit(1)
