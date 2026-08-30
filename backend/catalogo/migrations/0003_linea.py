# Generated for Linea persistence model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0002_alter_imagenproducto_imagen_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Linea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('es_sin_categoria', models.BooleanField(default=False)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'lineas',
                'ordering': ('nombre',),
            },
        ),
    ]
