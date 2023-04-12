import json

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.server.models import Notification, Room, User
from core.server.serializers import ProfileSerializer, UserSerializer
from core.server.utils import WebSocketsUtils


class ProfileView(RetrieveUpdateAPIView):

    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get_object(self):
        queryset = self.get_queryset()

        obj = get_object_or_404(queryset, pk=self.request.user.id)
        self.check_object_permissions(self.request, obj)

        return obj

    def get_serializer_context(self):
        context = super(ProfileView, self).get_serializer_context()

        if self.request.data.get("password") is None and self.request.data.get("new_password") is None:
            context["action"] = "update"
        else:
            context["action"] = "change"

        return context

    def update(self, request, *args, **kwargs):
        response = super(ProfileView, self).update(request, *args, **kwargs)

        room = Room.objects.filter(participants__in=[request.user])
        if response.status_code == 200 and room.exists():
            WebSocketsUtils.update_room(room.first().title)

        return response


class UserView(RetrieveUpdateAPIView):

    lookup_field = "username"
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):
        if self.request.method in ["PATCH", "PUT"]:
            return (IsAdminUser(),)
        return super(UserView, self).get_permissions()

    def retrieve(self, request, *args, **kwargs):
        response = super(UserView, self).retrieve(request, *args, **kwargs)

        if not response.data["is_active"]:
            raise NotFound("No user was found.")

        return response

    def update(self, request, *args, **kwargs):
        response = super(UserView, self).update(request, *args, **kwargs)

        if response.status_code == 200 and request.data.get("is_staff") is not None:
            Notification.objects.create(
                recipient=User.objects.get(username=kwargs["username"]),
                notification_type=Notification.NotificationType.STATUS_CHANGE,
                content=json.dumps({"promoted": response.data["is_staff"]})
            )
            WebSocketsUtils.update_notification_list(kwargs["username"])

        return response
