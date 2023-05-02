from collections import OrderedDict

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from core.server.models import User


class UserSerializer(ModelSerializer):

    online = serializers.BooleanField(source="is_online", read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        exclude = ("date_joined", "last_login", "groups", "user_permissions",)
        extra_kwargs = {
            "username": {
                "required": False
            },
            "email": {
                "required": False
            },
            "password": {
                "required": False,
                "write_only": True
            },
            "is_superuser": {
                "read_only": True
            }
        }

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["user"] = super(UserSerializer, self).to_representation(instance)

        data["user"].pop("email")

        if related or self.context["request"].method == "GET":
            return data["user"]

        if self.context["request"].method in ("PATCH", "PUT"):
            data["details"] = "User has been updated."

        return data


class ProfileSerializer(UserSerializer):

    new_password = serializers.CharField(max_length=128, required=False, write_only=True)

    def validate(self, attrs):
        if attrs.get("password") is None and attrs.get("new_password") is None:
            return super(UserSerializer, self).validate(attrs)

        if attrs.get("password") is None and attrs.get("new_password") is not None:
            raise ValidationError({"password": "This field is required."})

        if attrs.get("password") is not None and attrs.get("new_password") is None:
            raise ValidationError({"new_password": "This field is required."})

        if not self.instance.check_password(attrs.get("password")):
            raise ValidationError({"password": "Password mismatch."})

        return super(UserSerializer, self).validate(attrs)

    def update(self, instance, validated_data):
        if validated_data.get("new_password") is None:
            return super(UserSerializer, self).update(instance, validated_data)

        instance.set_password(validated_data["new_password"])
        instance.save()

        return instance

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["user"] = super(UserSerializer, self).to_representation(instance)

        if related or self.context["request"].method == "GET":
            return data["user"]

        if self.context.get("action") == "update":
            data["details"] = "Profile has been updated."
        elif self.context.get("action") == "change":
            data["details"] = "Password has been changed."

        return data
