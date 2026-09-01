import psycopg

print("Conectando a Supabase para habilitar RLS en todas las tablas del esquema public...")

conn = psycopg.connect(
    host="aws-0-sa-east-1.pooler.supabase.com",
    port=5432,
    dbname="postgres",
    user="postgres.pafjdawngyezbmkiblzq",
    password="rcestampaprodbdpassword",
    sslmode="require"
)
conn.autocommit = True
cur = conn.cursor()

# Query all tables in public schema
cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")
tables = [row[0] for row in cur.fetchall()]

print(f"Tablas encontradas en public ({len(tables)}):")
for t in tables:
    cur.execute(f"ALTER TABLE public.{t} ENABLE ROW LEVEL SECURITY;")
    print(f" [OK] RLS habilitado en: public.{t}")

cur.close()
conn.close()
print("\n¡Row Level Security (RLS) habilitado exitosamente en todas las tablas!")
