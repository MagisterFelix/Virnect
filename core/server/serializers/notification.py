import json
from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Message, Notification, Report, Room, User

from .message import MessageSerializer
from .report import ReportSerializer
from .room import RoomSerializer
from .user import UserSerializer


class NotificationSerializer(ModelSerializer):

    class Meta:
        model = Notification
        fields = "__all__"

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["notification"] = super(NotificationSerializer, self).to_representation(instance)

        self.context["related"] = True

        notification_type = data["notification"]["notification_type"]
        content = json.loads(data["notification"]["content"])

        if notification_type == Notification.NotificationType.MENTION:
            room = Room.objects.get(pk=content["room"])
            user = User.objects.get(pk=content["user"])

            content["room"] = RoomSerializer(instance=room, context=self.context).data
            content["user"] = UserSerializer(instance=user, context=self.context).data
        elif notification_type in (Notification.NotificationType.REPORT, Notification.NotificationType.WARNING):
            report = Report.objects.get(pk=content["report"])

            report = ReportSerializer(instance=report, context=self.context).data
            report["reason"] = Report.Reason.choices[report["reason"]][1]

            content["report"] = report
        elif notification_type == Notification.NotificationType.MESSAGE_REPLY:
            room = Room.objects.get(pk=content["room"])
            user = User.objects.get(pk=content["user"])
            message = Message.objects.get(pk=content["message"])

            content["room"] = RoomSerializer(instance=room, context=self.context).data
            content["user"] = UserSerializer(instance=user, context=self.context).data
            content["message"] = MessageSerializer(instance=message, context=self.context).data

        data["notification"]["content"] = content

        if related or self.context["request"].method == "GET":
            return data["notification"]

        data["details"] = "Notification has been updated."

        return data
