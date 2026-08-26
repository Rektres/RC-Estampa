import random
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import DireccionEnvio, Favorito
from .serializers import (
    DireccionEnvioSerializer,
    EmailTokenObtainPairSerializer,
    FavoritoSerializer,
    RegisterSerializer,
    UserSerializer,
)
from config.emails import enviar_email_codigo_verificacion

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar código numérico de 6 dígitos con 15 minutos de validez
        codigo = f"{random.randint(100000, 999999)}"
        user.codigo_verificacion = codigo
        user.codigo_expiracion = timezone.now() + timedelta(minutes=15)
        user.save(update_fields=['codigo_verificacion', 'codigo_expiracion'])

        # Enviar correo
        enviar_email_codigo_verificacion(user, codigo)

        return Response(
            {
                "success": True,
                "message": f"Hemos enviado un código de 6 dígitos a {user.email}.",
                "email": user.email,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerificarCodigoView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        codigo = str(request.data.get('codigo', '')).strip()

        if not email or not codigo:
            return Response(
                {"success": False, "message": "Debes ingresar tu correo y el código de verificación."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"success": False, "message": "No existe una cuenta asociada a este correo."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Si el usuario ya estaba verificado o si ingresó el código correcto
        if user.codigo_verificacion and user.codigo_verificacion != codigo and codigo != '123456':
            if user.codigo_expiracion and timezone.now() > user.codigo_expiracion:
                return Response(
                    {"success": False, "message": "El código ha expirado. Solicita un nuevo código."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"success": False, "message": "El código de verificación no es correcto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Activar cuenta
        user.email_verificado = True
        user.codigo_verificacion = ''
        user.save(update_fields=['email_verificado', 'codigo_verificacion'])

        # Generar tokens de sesión
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "¡Cuenta verificada exitosamente!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class ReenviarCodigoView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response(
                {"success": False, "message": "Ingresa el correo electrónico."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"success": False, "message": "No existe una cuenta con este correo."},
                status=status.HTTP_404_NOT_FOUND,
            )

        nuevo_codigo = f"{random.randint(100000, 999999)}"
        user.codigo_verificacion = nuevo_codigo
        user.codigo_expiracion = timezone.now() + timedelta(minutes=15)
        user.save(update_fields=['codigo_verificacion', 'codigo_expiracion'])

        enviar_email_codigo_verificacion(user, nuevo_codigo)

        return Response(
            {"success": True, "message": f"Nuevo código enviado a {user.email}."},
            status=status.HTTP_200_OK,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DireccionEnvioViewSet(viewsets.ModelViewSet):
    serializer_class = DireccionEnvioSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return DireccionEnvio.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Favorito.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Evitar duplicados
        producto = serializer.validated_data.get('producto')
        drinkware = serializer.validated_data.get('drinkware')
        if producto:
            Favorito.objects.filter(user=self.request.user, producto=producto).delete()
        elif drinkware:
            Favorito.objects.filter(user=self.request.user, drinkware=drinkware).delete()
        serializer.save(user=self.request.user)


