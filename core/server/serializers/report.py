from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Message, Report, Room

from .room import RoomSerializer
from .user import UserSerializer


class ReportSerializer(ModelSerializer):

    class Meta:
        model = Report
        exclude = ["sender", "reviewed_by"]

    def validate(self, attrs):
        user = self.context["request"].user

        if self.context["request"].method == "POST":
            attrs["sender"] = user
        elif self.context["request"].method in ("PATCH", "PUT") and attrs.get("verdict"):
            attrs["reviewed_by"] = user

        return super(ReportSerializer, self).validate(attrs)

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["report"] = super(ReportSerializer, self).to_representation(instance)

        data["report"]["sender"] = UserSerializer(instance=instance.sender, context=self.context).data
        data["report"]["accused"] = UserSerializer(instance=instance.accused, context=self.context).data

        if self.context["request"].method == "GET" and self.context["request"].user.is_staff:
            accused_rooms = Room.objects.filter(host=instance.accused)
            data["report"]["accused"]["rooms"] = [
                {
                    "id": room["id"],
                    "title": room["title"],
                    "tags": [{"id": tag["id"], "name": tag["name"]} for tag in room["tags"]]
                }
                for room in RoomSerializer(instance=accused_rooms, context=self.context, many=True).data
            ]

            accused_messages = Message.objects.filter(author=instance.accused)
            data["report"]["accused"]["messages"] = [
                {
                    "id": message.id,
                    "text": message.text
                }
                for message in accused_messages
            ]

        if instance.reviewed_by is not None:
            data["report"]["reviewed_by"] = UserSerializer(instance=instance.reviewed_by, context=self.context).data

        if self.context["request"].method == "GET" or related:
            return data["report"]

        if self.context["request"].method == "POST":
            data["details"] = "Report has been created."
        elif self.context["request"].method in ("PATCH", "PUT"):
            data["details"] = "Report has been updated."

        return data
