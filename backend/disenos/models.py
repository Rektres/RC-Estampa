from django.conf import settings
from django.db import models


class Diseno(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='disenos',
    )
    imagen = models.ImageField(upload_to='disenos/')
    prenda = models.CharField(max_length=100)
    color_base = models.CharField(max_length=20, blank=True)
    talla = models.CharField(max_length=20, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-creado_en',)

    def __str__(self):
        return f'Diseño {self.pk} - {self.prenda}'
