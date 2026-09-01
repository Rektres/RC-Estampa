import psycopg

regions = [
    "sa-east-1",     # São Paulo
    "us-east-1",     # N. Virginia
    "us-east-2",     # Ohio
    "us-west-1",     # N. California
    "us-west-2",     # Oregon
    "eu-west-1",     # Ireland
    "eu-central-1"   # Frankfurt
]

project_ref = "pafjdawngyezbmkiblzq"
password = "rcestampaprodbdpassword"

for r in regions:
    host = f"aws-0-{r}.pooler.supabase.com"
    print(f"Probando Supabase Pooler en región '{r}' ({host})...")
    try:
        conn = psycopg.connect(
            host=host,
            port=5432,
            dbname="postgres",
            user=f"postgres.{project_ref}",
            password=password,
            sslmode="require",
            connect_timeout=5
        )
        print(f" -> ¡CONEXIÓN EXITOSA EN LA REGIÓN '{r}' (IPv4 Pooler)!")
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            print(f" -> Versión: {cur.fetchone()[0]}")
        conn.close()
        break
    except Exception as e:
        print(f" -> Falló: {e}")
