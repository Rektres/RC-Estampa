import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage
import boto3

print("=== DIAGNOSTICO R2 ===")
print("USE_R2:", settings.USE_R2)
print("DEFAULT STORAGE CLASS:", default_storage.__class__.__name__)
print("MEDIA_URL:", settings.MEDIA_URL)

endpoint = os.environ.get('R2_ENDPOINT_URL')
key_id = os.environ.get('R2_ACCESS_KEY_ID')
secret = os.environ.get('R2_SECRET_ACCESS_KEY')
bucket_name = os.environ.get('R2_BUCKET_NAME')

print("R2_ENDPOINT_URL:", endpoint)
print("R2_BUCKET_NAME:", bucket_name)
print("R2_ACCESS_KEY_ID:", key_id[:6] + "..." if key_id else None)

try:
    s3 = boto3.client(
        's3',
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        region_name='auto'
    )
    
    print(f"Probando subida directa a bucket '{bucket_name}'...")
    s3.put_object(
        Bucket=bucket_name,
        Key='test_conexion.txt',
        Body=b'Conexion exitosa con Cloudflare R2 desde RC Estampa!',
        ContentType='text/plain'
    )
    print(" -> put_object exitoso!")

    print(f"Listando objetos en '{bucket_name}'...")
    objs = s3.list_objects_v2(Bucket=bucket_name)
    key_count = objs.get('KeyCount', 0)
    print(" -> KeyCount en bucket:", key_count)
    if 'Contents' in objs:
        print(f"Total de archivos listados: {len(objs['Contents'])}")
        for item in objs['Contents'][:10]:
            print("   -", item['Key'], f"({item['Size']} bytes)")
    else:
        print(" -> Bucket actualmente vacio.")
except Exception as e:
    print("ERROR AL OPERAR EN R2:", type(e), e)
