from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager for the email-login custom user."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'admin')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLES = (('admin', 'Admin'), ('cliente', 'Cliente'))

    username = None
    email = models.EmailField('email', unique=True)
    nombre = models.CharField(max_length=150, blank=True)
    rol = models.CharField(max_length=10, choices=ROLES, default='cliente')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class DireccionEnvio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direcciones')
    nombre_destinatario = models.CharField(max_length=150)
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    codigo_postal = models.CharField(max_length=20, blank=True)
    es_principal = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.nombre_destinatario} - {self.ciudad}'
