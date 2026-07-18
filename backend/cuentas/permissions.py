from rest_framework.permissions import BasePermission


class IsAdminRol(BasePermission):
    """Permite acceso solo a usuarios con rol admin (o staff de Django)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and (user.rol == 'admin' or user.is_staff)
        )
