from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Room

from .user import UserSerializer


class RoomListSerializer(ModelSerializer):

    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = "__all__"

    def to_representation(self, instance):
        if self.context["request"].method == "GET":
            return super(RoomListSerializer, self).to_representation(instance)

        data = OrderedDict()

        data["details"] = "Room has been created."

        return data
