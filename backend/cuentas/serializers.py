from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import DireccionEnvio, Favorito
from catalogo.serializers import ProductoSerializer, ProductoVajillaSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'nombre', 'rol', 'telefono', 'rut',
            'direccion', 'comuna', 'ciudad', 'region', 'email_verificado'
        )
        read_only_fields = ('id', 'email', 'rol', 'email_verificado')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'nombre', 'password', 'telefono',
            'rut', 'direccion', 'comuna', 'ciudad', 'region'
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            nombre=validated_data.get('nombre', ''),
            telefono=validated_data.get('telefono', ''),
            rut=validated_data.get('rut', ''),
            direccion=validated_data.get('direccion', ''),
            comuna=validated_data.get('comuna', ''),
            ciudad=validated_data.get('ciudad', ''),
            region=validated_data.get('region', ''),
        )
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds the serialized user to the token response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class DireccionEnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionEnvio
        fields = (
            'id', 'nombre_destinatario', 'direccion', 'comuna',
            'ciudad', 'region', 'codigo_postal', 'es_principal',
        )


class FavoritoSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoSerializer(source='producto', read_only=True)
    drinkware_detalle = ProductoVajillaSerializer(source='drinkware', read_only=True)

    class Meta:
        model = Favorito
        fields = ('id', 'producto', 'drinkware', 'producto_detalle', 'drinkware_detalle', 'creado_en')
        extra_kwargs = {
            'producto': {'required': False, 'allow_null': True},
            'drinkware': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        producto = attrs.get('producto')
        drinkware = attrs.get('drinkware')
        if not producto and not drinkware:
            raise serializers.ValidationError('Debes indicar un producto o un artículo de drinkware.')
        return attrs



