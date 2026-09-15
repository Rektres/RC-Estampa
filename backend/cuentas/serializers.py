from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import DireccionEnvio, Favorito, EmailLog
from catalogo.serializers import ProductoSerializer, ProductoVajillaSerializer

import re

User = get_user_model()


def validar_y_normalizar_rut(rut_str):
    if not rut_str:
        return ''
    clean = re.sub(r'[^0-9kK]', '', str(rut_str)).upper()
    if len(clean) < 7 or len(clean) > 9:
        raise serializers.ValidationError('El RUT debe tener entre 7 y 9 dígitos incluyendo el dígito verificador.')
    cuerpo, dv = clean[:-1], clean[-1]
    
    suma = 0
    multiplo = 2
    for c in reversed(cuerpo):
        suma += int(c) * multiplo
        multiplo = multiplo + 1 if multiplo < 7 else 2
    
    resto = 11 - (suma % 11)
    if resto == 11:
        dv_esperado = '0'
    elif resto == 10:
        dv_esperado = 'K'
    else:
        dv_esperado = str(resto)
        
    if dv != dv_esperado:
        raise serializers.ValidationError('El RUT ingresado no es válido (dígito verificador incorrecto).')
        
    return f"{cuerpo}-{dv}"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'nombre', 'rol', 'telefono', 'rut',
            'direccion', 'comuna', 'ciudad', 'region', 'email_verificado'
        )
        read_only_fields = ('id', 'email', 'rol', 'email_verificado', 'rut')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'nombre', 'password', 'telefono',
            'rut', 'direccion', 'comuna', 'ciudad', 'region'
        )

    def validate_rut(self, value):
        if not value:
            return ''
        norm_rut = validar_y_normalizar_rut(value)
        if User.objects.filter(rut=norm_rut).exists():
            raise serializers.ValidationError('Este RUT ya se encuentra registrado en otra cuenta.')
        return norm_rut

    def validate_telefono(self, value):
        if not value:
            return ''
        digits = re.sub(r'\D', '', str(value))
        if digits.startswith('569'):
            digits = digits[3:]
        elif digits.startswith('9'):
            digits = digits[1:]
        if len(digits) != 8:
            raise serializers.ValidationError('El teléfono debe tener 8 dígitos móviles tras el prefijo +56 9.')
        return f"+569{digits}"

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


class EmailLogSerializer(serializers.ModelSerializer):
    creado_por_email = serializers.ReadOnlyField(source='creado_por.email')

    class Meta:
        model = EmailLog
        fields = (
            'id', 'remitente', 'destinatario', 'asunto', 'mensaje',
            'estado', 'error', 'creado_por', 'creado_por_email', 'creado_en'
        )
        read_only_fields = ('id', 'estado', 'error', 'creado_por', 'creado_en')




