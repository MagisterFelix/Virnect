import json
import re

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Message, Notification, Room, User
from core.server.permissions import IsOwnerOrReadOnly
from core.server.serializers import MessageSerializer
from core.server.utils import WebSocketUtils


class MessageListView(ListCreateAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(MessageListView, self).get_queryset()
        return queryset.filter(room__title=self.kwargs["room"])

    def create(self, request, *args, **kwargs):
        response = super(MessageListView, self).create(request, *args, **kwargs)

        if response.status_code == 201:
            room = Room.objects.get(title=kwargs["room"])
            message = Message.objects.get(pk=response.data["message"]["id"])

            mentioned_users = User.objects.filter(username__in=re.findall(r"@(\w+)", request.data["text"]))

            for user in mentioned_users:
                if user.id != message.author.id and user not in room.participants.all():
                    Notification.objects.create(
                        recipient=user,
                        notification_type=Notification.NotificationType.MENTION,
                        content=json.dumps({"room": room.id, "user": message.author.id})
                    )
                    WebSocketUtils.update_notification_list(user_id=user.id)

            if message.reply_to is not None and message.reply_to.author.id != message.author.id:
                user = User.objects.get(pk=message.reply_to.author.id)

                if user not in mentioned_users and user not in room.participants.all():
                    Notification.objects.create(
                        recipient=user,
                        notification_type=Notification.NotificationType.MESSAGE_REPLY,
                        content=json.dumps({
                            "room": room.id,
                            "user": message.author.id,
                            "message": message.id
                        })
                    )
                    WebSocketUtils.update_notification_list(user_id=user.id)

        return response


class MessageView(RetrieveUpdateDestroyAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def get_queryset(self):
        queryset = super(MessageView, self).get_queryset()
        return queryset.filter(room__title=self.kwargs["room"])

    def update(self, request, *args, **kwargs):
        response = super(MessageView, self).update(request, *args, **kwargs)

        if response.status_code == 200:
            room = Room.objects.get(title=kwargs["room"])
            message = Message.objects.get(pk=kwargs["pk"])

            mentioned_users = User.objects.filter(username__in=re.findall(r"@(\w+)", request.data.get("text", "")))

            for user in mentioned_users:
                if user.id != message.author.id and user not in room.participants.all():
                    Notification.objects.create(
                        recipient=user,
                        notification_type=Notification.NotificationType.MENTION,
                        content=json.dumps({"room": room.id, "user": message.author.id})
                    )
                    WebSocketUtils.update_notification_list(user_id=user.id)

        return response
