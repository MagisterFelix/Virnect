import json
from datetime import timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.server.models import Message, Notification, Report, Room, User
from core.server.serializers import NotificationSerializer, ProfileSerializer, UserSerializer
from core.server.utils import WebSocketUtils


class ProfileView(RetrieveUpdateAPIView):

    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get_object(self):
        queryset = self.get_queryset()

        obj = get_object_or_404(queryset, pk=self.request.user.id)
        self.check_object_permissions(self.request, obj)

        old_notifications = Notification.objects.filter(Q(created_at__lt=timezone.now() - timedelta(days=7)))
        if old_notifications.exists():
            old_notifications.delete()

        for notification in Notification.objects.filter(recipient=self.request.user):
            content = json.loads(notification.content)

            if notification.notification_type == Notification.NotificationType.MENTION:
                room = Room.objects.get_or_none(pk=content["room"])
                user = User.objects.get_or_none(pk=content["user"])

                if room is None or user is None:
                    notification.delete()
            elif notification.notification_type in (Notification.NotificationType.REPORT,
                                                    Notification.NotificationType.WARNING):
                report = Report.objects.get_or_none(pk=content["report"])

                if report is None:
                    notification.delete()
            elif notification.notification_type == Notification.NotificationType.MESSAGE_REPLY:
                room = Room.objects.get_or_none(pk=content["room"])
                user = User.objects.get_or_none(pk=content["user"])
                message = Message.objects.get_or_none(pk=content["message"])

                if room is None or user is None or message is None or message.reply_to is None:
                    notification.delete()

        return obj

    def get_serializer_context(self):
        context = super(ProfileView, self).get_serializer_context()

        if self.request.data.get("password") is None and self.request.data.get("new_password") is None:
            context["action"] = "update"
        else:
            context["action"] = "change"

        return context

    def retrieve(self, request, *args, **kwargs):
        response = super(ProfileView, self).retrieve(request, *args, **kwargs)

        if response.status_code == 200:
            response.data["notifications"] = NotificationSerializer(
                instance=Notification.objects.filter(recipient=request.user.id),
                context=self.get_serializer_context(),
                many=True
            ).data

        return response

    def update(self, request, *args, **kwargs):
        response = super(ProfileView, self).update(request, *args, **kwargs)

        room = Room.objects.filter(participants__in=[request.user])
        if response.status_code == 200 and room.exists():
            WebSocketUtils.update_room(room_id=room.first().pk, room_title=room.first().title)

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
            user = User.objects.get(username=kwargs["username"])

            Notification.objects.create(
                recipient=user,
                notification_type=Notification.NotificationType.STATUS_CHANGE,
                content=json.dumps({"promoted": user.is_staff})
            )
            WebSocketUtils.update_notification_list(user_id=user.id)

        return response
