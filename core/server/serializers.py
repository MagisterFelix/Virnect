from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class AuthorizationSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        attr = attrs["username"]
        user = User.objects.get_or_none(Q(username=attr) | Q(email=attr))

        if user is not None:
            attrs["username"] = user.username

        return super(AuthorizationSerializer, self).validate(attrs)


class RegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "email", "password",)
        extra_kwargs = {
            "password": {
                "write_only": True
            },
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
