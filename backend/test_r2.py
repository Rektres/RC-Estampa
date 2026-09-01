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
    buckets = s3.list_buckets()
    print("Buckets encontrados:", [b['Name'] for b in buckets.get('Buckets', [])])

    objs = s3.list_objects_v2(Bucket=bucket_name)
    print("KeyCount en bucket", bucket_name, ":", objs.get('KeyCount', 0))
    if 'Contents' in objs:
        print("Total de archivos encontrados:", len(objs['Contents']))
        for item in objs['Contents'][:10]:
            print(" -", item['Key'], f"({item['Size']} bytes)")
    else:
        print("No se encontraron objetos ('Contents' no presente en respuesta S3)")
except Exception as e:
    print("ERROR AL CONECTAR CON R2:", type(e), e)
