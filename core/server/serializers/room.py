import hashlib
from collections import OrderedDict

from rest_framework.exceptions import PermissionDenied
from rest_framework.serializers import ModelSerializer

from core.server.models import Room, Tag

from .tag import TagSerializer
from .topic import TopicSerializer
from .user import UserSerializer


class RoomSerializer(ModelSerializer):

    class Meta:
        model = Room
        exclude = ["host"]

    def validate(self, attrs):
        user = self.context["request"].user

        if self.context["request"].method == "POST" and Room.objects.filter(host=user).count() == 5:
            raise PermissionDenied("User cannot host more than 5 rooms.")

        attrs["host"] = user

        return super(RoomSerializer, self).validate(attrs)

    def to_representation(self, instance):
        data = OrderedDict()

        data["room"] = super(RoomSerializer, self).to_representation(instance)

        self.context["related"] = True

        data["room"]["host"] = UserSerializer(instance=instance.host, context=self.context).data
        data["room"]["topic"] = TopicSerializer(instance=instance.topic, context=self.context).data
        data["room"]["tags"] = TagSerializer(
            instance=Tag.objects.filter(room=instance.id),
            context=self.context,
            many=True
        ).data
        data["room"]["participants"] = UserSerializer(
            instance=instance.participants,
            context=self.context,
            many=True
        ).data

        if len(instance.key) > 0 and instance.host != self.context["request"].user:
            data["room"]["key"] = hashlib.sha256(instance.key.encode()).hexdigest()

        if self.context["request"].method == "GET":
            return data["room"]

        if self.context["request"].method == "POST":
            data["details"] = "Room has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Room has been updated."
        elif self.context["request"].method == "DELETE":
            data["details"] = "Room has been deleted."

        return data
