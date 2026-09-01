import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files import File


class Command(BaseCommand):
    help = 'Migra todos los archivos de media locales existentes al almacenamiento configurado (Cloudflare R2).'

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

        self.stdout.write(self.style.MIGRATE_HEADING(f'Iniciando migración desde: {media_root} hacia {default_storage.__class__.__name__}...'))

        subidos = 0
        omitidos = 0
        errores = 0

        for root, _, files in os.walk(media_root):
            for file_name in files:
                local_path = Path(root) / file_name
                rel_path = local_path.relative_to(media_root).as_posix()

                try:
                    if not overwrite and default_storage.exists(rel_path):
                        self.stdout.write(f' [OMITIDO] Ya existe en R2: {rel_path}')
                        omitidos += 1
                        continue

                    with open(local_path, 'rb') as f:
                        if default_storage.exists(rel_path) and overwrite:
                            default_storage.delete(rel_path)
                        default_storage.save(rel_path, File(f))

                    self.stdout.write(self.style.SUCCESS(f' [SUBIDO] {rel_path} -> R2'))
                    subidos += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f' [ERROR] Fallo al subir {rel_path}: {e}'))
                    errores += 1

        self.stdout.write(self.style.SUCCESS(f'\n=== Migración finalizada ==='))
        self.stdout.write(f'Archivos subidos: {subidos}')
        self.stdout.write(f'Archivos omitidos (ya existían): {omitidos}')
        if errores > 0:
            self.stdout.write(self.style.ERROR(f'Errores: {errores}'))
        else:
            self.stdout.write(self.style.SUCCESS('Sin errores.'))
