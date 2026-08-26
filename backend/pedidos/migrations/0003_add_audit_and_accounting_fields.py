from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0002_add_comuna_and_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='payment_method_id',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='pedido',
            name='payment_type_id',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='pedido',
            name='card_last_four',
            field=models.CharField(blank=True, max_length=4),
        ),
        migrations.AddField(
            model_name='pedido',
            name='card_first_six',
            field=models.CharField(blank=True, max_length=6),
        ),
        migrations.AddField(
            model_name='pedido',
            name='cardholder_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='pedido',
            name='cardholder_identification',
            field=models.CharField(blank=True, max_length=30),
        ),
        migrations.AddField(
            model_name='pedido',
            name='authorization_code',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='pedido',
            name='cuotas',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='pedido',
            name='monto_neto',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='pedido',
            name='comision_mp',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='pedido',
            name='estado_detalle',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='pedido',
            name='ip_cliente',
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pedido',
            name='user_agent',
            field=models.TextField(blank=True),
        ),
    ]
