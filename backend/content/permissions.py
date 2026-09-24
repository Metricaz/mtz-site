from rest_framework.permissions import SAFE_METHODS, BasePermission


def is_staff(user):
    return bool(user and user.is_authenticated and user.is_active and user.is_staff)


class IsStaffOrReadOnly(BasePermission):
    """Anyone can read; only logged-in staff (the dashboard) can write."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or is_staff(request.user)


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return is_staff(request.user)
