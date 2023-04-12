from rest_framework.exceptions import NotFound
from rest_framework.permissions import SAFE_METHODS, IsAdminUser, IsAuthenticated

from .models import Message, Room, Tag


class IsAdminUserOrReadOnly(IsAdminUser):

    def has_permission(self, request, view):
        is_admin = super(IsAdminUserOrReadOnly, self).has_permission(request, view)
        return is_admin or request.method in SAFE_METHODS


class IsOwnerOrReadOnly(IsAuthenticated):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        is_authenticated = super(IsOwnerOrReadOnly, self).has_permission(request, view)

        if not is_authenticated:
            return False

        if request.path.startswith("/api/room") and request.method != "POST":
            room = Room.objects.get_or_none(title=view.kwargs.get("title"))

            if room is None:
                raise NotFound()

            return room.host == request.user

        if request.path.startswith("/api/tag"):
            if request.method == "POST":
                room = Room.objects.get_or_none(pk=request.data.get("room"))
            else:
                tag = Tag.objects.get_or_none(pk=view.kwargs.get("pk"))

                if tag is None:
                    raise NotFound()

                room = Room.objects.get_or_none(pk=tag.room.id)

            if room is None:
                raise NotFound()

            return room.host == request.user

        if request.path.startswith("/api/message"):
            message = Message.objects.get_or_none(pk=view.kwargs.get("pk"))

            if message is None:
                raise NotFound()

            return message.author == request.user

        return False


class IsParticipant(IsAuthenticated):

    def has_permission(self, request, view):
        is_authenticated = super(IsParticipant, self).has_permission(request, view)

        room = Room.objects.get_or_none(title=view.kwargs.get("title"))

        if room is None:
            raise NotFound()

        return is_authenticated and request.user in room.participants.all()
