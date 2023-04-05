from collections import OrderedDict

from rest_framework.exceptions import PermissionDenied
from rest_framework.serializers import ModelSerializer

from core.server.models import Room, Tag

from .tag import TagListSerializer
from .topic import TopicSerializer
from .user import UserSerializer


class RoomListSerializer(ModelSerializer):

    class Meta:
        model = Room
        fields = "__all__"

    def validate(self, attrs):
        if Room.objects.filter(host=self.context["request"].user).count() == 5:
            raise PermissionDenied("User cannot host more than 5 rooms.")

        return super(RoomListSerializer, self).validate(attrs)

    def to_representation(self, instance):
        if self.context["request"].method == "GET":
            data = super(RoomListSerializer, self).to_representation(instance)

            tags = Tag.objects.filter(room=instance.id)

            data["host"] = UserSerializer(instance=instance.host, context=self.context).data
            data["topic"] = TopicSerializer(instance=instance.topic, context=self.context).data
            data["tags"] = TagListSerializer(instance=tags, context=self.context, many=True).data
            data["participants"] = UserSerializer(instance=instance.participants, context=self.context, many=True).data

            return data

        data = OrderedDict()

        data["details"] = "Room has been created."

        return data
