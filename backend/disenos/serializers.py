import base64
import uuid

from django.core.files.base import ContentFile
from rest_framework import serializers

from .models import Diseno


class DisenoSerializer(serializers.ModelSerializer):
    # Recibe el PNG del canvas como data URL (data:image/png;base64,....)
    imagen_base64 = serializers.CharField(write_only=True)
    imagen = serializers.ImageField(read_only=True)

    class Meta:
        model = Diseno
        fields = ('id', 'imagen', 'imagen_base64', 'prenda', 'color_base', 'talla', 'creado_en')
        read_only_fields = ('id', 'imagen', 'creado_en')

    def validate_imagen_base64(self, value):
        if ';base64,' in value:
            value = value.split(';base64,', 1)[1]
        try:
            base64.b64decode(value)
        except Exception as exc:
            raise serializers.ValidationError('Imagen base64 inválida') from exc
        return value

    def create(self, validated_data):
        raw = validated_data.pop('imagen_base64')
        data = base64.b64decode(raw)
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        diseno = Diseno(user=user, **validated_data)
        diseno.imagen.save(f'{uuid.uuid4().hex}.png', ContentFile(data), save=False)
        diseno.save()
        return diseno
