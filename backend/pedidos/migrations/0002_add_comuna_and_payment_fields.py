from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='comuna',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='pedido',
            name='metodo_pago',
            field=models.CharField(choices=[('mercadopago', 'Mercado Pago'), ('transferencia', 'Transferencia Bancaria')], default='mercadopago', max_length=20),
        ),
        migrations.AddField(
            model_name='pedido',
            name='transaccion_id',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='pedido',
            name='url_pago',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='pedido',
            name='pagado_en',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pedido',
            name='datos_pago_raw',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
