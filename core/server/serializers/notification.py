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
        data = OrderedDict()

        data["notification"] = super(NotificationSerializer, self).to_representation(instance)

        self.context["related"] = True

        notification_type = data["notification"]["notification_type"]
        content = json.loads(data["notification"]["content"])

        if notification_type == Notification.NotificationType.MENTION:
            room = Room.objects.get_or_none(pk=content["room"])
            user = User.objects.get_or_none(pk=content["user"])

            if room is None or user is None:
                content = None
            else:
                room = RoomSerializer(instance=room, context=self.context).data
                user = UserSerializer(instance=user, context=self.context).data

                content["room"] = room
                content["user"] = user
        elif notification_type in (Notification.NotificationType.REPORT, Notification.NotificationType.WARNING):
            report = Report.objects.get_or_none(pk=content["report"])

            if report is None:
                content = None
            else:
                report = ReportSerializer(instance=report, context=self.context).data
                report["reason"] = Report.Reason.choices[report["reason"]][1]

                content["report"] = report
        elif notification_type == Notification.NotificationType.MESSAGE_REPLY:
            room = Room.objects.get_or_none(pk=content["room"])
            user = User.objects.get_or_none(pk=content["user"])
            message = Message.objects.get_or_none(pk=content["message"])

            if room is None or user is None or message is None or message.reply_to is None:
                content = None
            else:
                room = RoomSerializer(instance=room, context=self.context).data
                user = UserSerializer(instance=user, context=self.context).data
                message = MessageSerializer(instance=message, context=self.context).data

                content["room"] = room
                content["user"] = user
                content["message"] = message

        data["notification"]["content"] = content

        if self.context["request"].method == "GET":
            return data["notification"]

        data["details"] = "Notification has been updated."

        return data
