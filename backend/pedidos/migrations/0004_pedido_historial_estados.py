from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0003_add_audit_and_accounting_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='historial_estados',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
