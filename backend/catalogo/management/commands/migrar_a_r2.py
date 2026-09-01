import os
import mimetypes
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
import boto3


class Command(BaseCommand):
    help = 'Migra todos los archivos de media locales existentes directamente al bucket de Cloudflare R2.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Sobrescribe los archivos en R2 si ya existen.',
        )

    def handle(self, *args, **options):
        media_root = Path(settings.BASE_DIR) / 'media'
        overwrite = options.get('overwrite', False)

        if not media_root.exists():
            self.stdout.write(self.style.WARNING(f'La carpeta local de media no existe: {media_root}'))
            return

        endpoint = os.environ.get('R2_ENDPOINT_URL')
        key_id = os.environ.get('R2_ACCESS_KEY_ID')
        secret = os.environ.get('R2_SECRET_ACCESS_KEY')
        bucket_name = os.environ.get('R2_BUCKET_NAME')

        if not (endpoint and key_id and secret and bucket_name):
            self.stdout.write(self.style.ERROR('Faltan variables de entorno R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY o R2_BUCKET_NAME.'))
            return

        s3 = boto3.client(
            's3',
            endpoint_url=endpoint,
            aws_access_key_id=key_id,
            aws_secret_access_key=secret,
            region_name='auto'
        )

        self.stdout.write(self.style.MIGRATE_HEADING(f'Iniciando migración desde {media_root} hacia Cloudflare R2 (Bucket: {bucket_name})...'))

        # Obtener lista de claves ya existentes si no se fuerza overwrite
        existing_keys = set()
        if not overwrite:
            paginator = s3.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=bucket_name):
                for obj in page.get('Contents', []):
                    existing_keys.add(obj['Key'])

        subidos = 0
        omitidos = 0
        errores = 0

        for root, _, files in os.walk(media_root):
            for file_name in files:
                local_path = Path(root) / file_name
                rel_path = local_path.relative_to(media_root).as_posix()

                if not overwrite and rel_path in existing_keys:
                    self.stdout.write(f' [OMITIDO] Ya existe en R2: {rel_path}')
                    omitidos += 1
                    continue

                content_type, _ = mimetypes.guess_type(str(local_path))
                if not content_type:
                    content_type = 'application/octet-stream'

                try:
                    with open(local_path, 'rb') as f:
                        s3.put_object(
                            Bucket=bucket_name,
                            Key=rel_path,
                            Body=f.read(),
                            ContentType=content_type,
                        )
                    self.stdout.write(self.style.SUCCESS(f' [SUBIDO] {rel_path} ({content_type}) -> R2'))
                    subidos += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f' [ERROR] Fallo al subir {rel_path}: {e}'))
                    errores += 1

        self.stdout.write(self.style.SUCCESS(f'\n=== Migración finalizada con éxito ==='))
        self.stdout.write(f'Archivos subidos: {subidos}')
        self.stdout.write(f'Archivos omitidos (ya existían): {omitidos}')
        if errores > 0:
            self.stdout.write(self.style.ERROR(f'Errores: {errores}'))
        else:
            self.stdout.write(self.style.SUCCESS('Sin errores.'))

