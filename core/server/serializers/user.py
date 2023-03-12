from collections import OrderedDict

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from core.server.models.user import User


class UserSerializer(ModelSerializer):

    online = serializers.BooleanField(source="is_online", read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    new_password = serializers.CharField(max_length=128, required=False, write_only=True)

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
            },
            "is_staff": {
                "read_only": True
            },
            "is_active": {
                "read_only": True
            }
        }

    def validate(self, attrs):
        if attrs.get("new_password") is None:
            return super(UserSerializer, self).validate(attrs)

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
        if self.context.get("action") is None:
            return super(UserSerializer, self).to_representation(instance)

        data = OrderedDict()

        if self.context["action"] == "update":
            data["details"] = "Profile has been updated."
        else:
            data["details"] = "Password has been changed."

        return data
