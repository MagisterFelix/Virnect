from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import SAFE_METHODS, IsAdminUser, IsAuthenticated

from .models import Room


class IsAdminUserOrReadOnly(IsAdminUser):

    def has_permission(self, request, view):
        is_admin = super(IsAdminUserOrReadOnly, self).has_permission(request, view)
        return is_admin or request.method in SAFE_METHODS


class IsOwnerOrReadOnly(IsAuthenticated):

    def has_permission(self, request, view):
        is_authenticated = super(IsOwnerOrReadOnly, self).has_permission(request, view)

        if request.method in SAFE_METHODS:
            return is_authenticated

        room = None

        if "room" in request.path:
            room = Room.objects.get_or_none(id=view.kwargs.get("id"))
        elif "tag" in request.path:
            if isinstance(request.data, list):
                ids = set(data.get("room") for data in request.data)
                if len(ids) == 0 or None in ids:
                    raise ValidationError("Room ids must be provided.")

                if len(ids) != 1:
                    raise ValidationError("Room ids must be the same.")

                room = Room.objects.get_or_none(id=ids.pop())
            else:
                room = Room.objects.get_or_none(id=request.data.get("room"))

        if room is None:
            raise NotFound()

        return is_authenticated and room.host == request.user
