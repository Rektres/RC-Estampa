import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from catalogo.models import (
    Categoria,
    ColorEditor,
    FotoCliente,
    ImagenProducto,
    ImagenVajilla,
    PrecioEditor,
    Producto,
    ProductoVajilla,
    Region,
    TallaStandard,
    VarianteProducto,
    VarianteVajilla,
)

DATA_FILE = Path(__file__).resolve().parent.parent.parent / 'seed_data.json'


class Command(BaseCommand):
    help = 'Carga el catálogo inicial (productos, drinkware, fotos, config editor) desde seed_data.json'

    @transaction.atomic
    def handle(self, *args, **options):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))

        cats = {}
        for c in data['categorias']:
            obj, _ = Categoria.objects.update_or_create(
                slug=c['slug'],
                defaults={'nombre': c['nombre'], 'linea': c.get('linea', '')},
            )
            cats[c['slug']] = obj

        for p in data['productos']:
            producto, _ = Producto.objects.update_or_create(
                slug=p['slug'],
                defaults={
                    'nombre': p['nombre'],
                    'descripcion': p['descripcion'],
                    'precio': p['precio'],
                    'precio_oferta': p.get('precio_oferta'),
                    'activo': p['activo'],
                    'destacado': p['destacado'],
                    'nuevo': p['nuevo'],
                    'linea': p['linea'],
                    'categoria': cats[p['categoria']],
                },
            )
            producto.variantes.all().delete()
            producto.imagenes.all().delete()
            for v in p['variantes']:
                VarianteProducto.objects.create(producto=producto, **v)
            for img in p['imagenes']:
                ImagenProducto.objects.create(producto=producto, **img)

        for p in data['vajilla']:
            vajilla, _ = ProductoVajilla.objects.update_or_create(
                slug=p['slug'],
                defaults={
                    'nombre': p['nombre'],
                    'descripcion': p['descripcion'],
                    'material': p['material'],
                    'capacidad_ml': p.get('capacidad_ml'),
                    'precio': p['precio'],
                    'precio_oferta': p.get('precio_oferta'),
                    'activo': p['activo'],
                    'destacado': p['destacado'],
                    'nuevo': p['nuevo'],
                    'linea': 'drinkware',
                    'categoria': cats[p['categoria']],
                },
            )
            vajilla.variantes.all().delete()
            vajilla.imagenes.all().delete()
            for v in p['variantes']:
                VarianteVajilla.objects.create(producto=vajilla, **v)
            for img in p['imagenes']:
                ImagenVajilla.objects.create(producto=vajilla, **img)

        FotoCliente.objects.all().delete()
        for f in data['fotos']:
            FotoCliente.objects.create(**f)

        for i, c in enumerate(data['colores_editor']):
            ColorEditor.objects.update_or_create(
                hex=c['hex'], defaults={'nombre': c['nombre'], 'orden': i}
            )

        for key, precio in data['precios_editor'].items():
            PrecioEditor.objects.update_or_create(
                producto_key=key, defaults={'precio': precio}
            )

        for i, t in enumerate(data['tallas']):
            TallaStandard.objects.update_or_create(nombre=t, defaults={'orden': i})

        for i, r in enumerate(data['regiones']):
            Region.objects.update_or_create(nombre=r, defaults={'orden': i})

        self.stdout.write(self.style.SUCCESS(
            f"Seed OK: {Producto.objects.count()} productos, "
            f"{ProductoVajilla.objects.count()} drinkware, "
            f"{FotoCliente.objects.count()} fotos."
        ))
