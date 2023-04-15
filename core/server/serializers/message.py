from collections import OrderedDict

from rest_framework import serializers
from rest_framework.exceptions import NotFound
from rest_framework.serializers import ModelSerializer

from core.server.models import Message, Room

from .room import RoomSerializer
from .user import UserSerializer


class MessageSerializer(ModelSerializer):

    short_message = serializers.CharField(read_only=True)

    class Meta:
        model = Message
        exclude = ["author", "room"]

    def validate(self, attrs):
        user = self.context["request"].user

        attrs["author"] = user

        room = Room.objects.get_or_none(title=self.context["view"].kwargs["room"])
        if room is None:
            raise NotFound("Room was not found.")

        attrs["room"] = room

        return super(MessageSerializer, self).validate(attrs)

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["message"] = super(MessageSerializer, self).to_representation(instance)

        self.context["related"] = True

        data["message"]["author"] = UserSerializer(instance=instance.author, context=self.context).data
        data["message"]["room"] = RoomSerializer(instance=instance.room, context=self.context).data

        if instance.reply_to is not None:
            data["message"]["reply_to"] = MessageSerializer(instance=instance.reply_to, context=self.context).data

        if self.context["request"].method == "GET" or related:
            return data["message"]

        if self.context["request"].method == "POST":
            data["details"] = "Message has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Message has been updated."
        elif self.context["request"].method == "DELETE":
            data["details"] = "Message has been deleted."

        return data
