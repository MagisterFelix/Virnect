import hashlib
from collections import OrderedDict

from rest_framework import serializers
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.serializers import ModelSerializer, Serializer

from core.server.models import Room, Tag, User

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
        related = self.context.get("related")

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
            instance=sorted(instance.participants.all(), key=lambda user: user.id != instance.host.id),
            context=self.context,
            many=True
        ).data

        user = self.context["request"].user

        if len(instance.key) > 0 and instance.host != user:
            data["room"]["key"] = hashlib.sha256(instance.key.encode()).hexdigest()

        if self.context["request"].method == "GET" or related:
            return data["room"]

        if self.context["request"].method == "POST":
            data["details"] = "Room has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Room has been updated."
        elif self.context["request"].method == "DELETE":
            data["details"] = "Room has been deleted."

        return data


class ConnectingSerializer(Serializer):

    user = serializers.IntegerField(required=True)
    key = serializers.CharField(max_length=16, required=False, write_only=True)

    def validate(self, attrs):
        user = User.objects.get_or_none(pk=attrs["user"])
        key = attrs.get("key")

        if user is None:
            raise NotFound("No user was found.")

        if Room.objects.filter(participants__in=[user]).count() != 0:
            raise PermissionDenied("User is already in the room.")

        if self.instance.participants.count() == self.instance.number_of_participants:
            raise PermissionDenied("Room is full.")

        if self.instance.host == user:
            return super(ConnectingSerializer, self).validate(attrs)

        if len(self.instance.key) > 0 and key is None:
            raise PermissionDenied("Key must be provided.")

        if len(self.instance.key) > 0 and key != self.instance.key:
            raise PermissionDenied("Key mismatch.")

        attrs["user"] = user

        return super(ConnectingSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        user = validated_data["user"]

        instance.participants.add(user)
        instance.save()

        return instance


class DisconnectingSerializer(Serializer):

    user = serializers.IntegerField(required=True)

    def validate(self, attrs):
        user = User.objects.get_or_none(pk=attrs["user"])

        if user is None:
            raise NotFound("No user was found.")

        if user not in self.instance.participants.all():
            raise PermissionDenied("User is not in room.")

        attrs["user"] = user

        return super(DisconnectingSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        user = validated_data["user"]

        instance.participants.remove(user)
        instance.save()

        return instance
