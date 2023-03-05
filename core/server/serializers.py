from django.contrib.auth.tokens import default_token_generator
from django.db.models import Q
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class AuthorizationSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        attr = attrs["username"]

        user = User.objects.get_or_none(Q(username=attr) | Q(email=attr))

        if user is None:
            raise AuthenticationFailed("No user was found with these credentials.")

        attrs["username"] = user.username

        return super(AuthorizationSerializer, self).validate(attrs)


class RegistrationSerializer(ModelSerializer):

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


class PasswordResetSerializer(Serializer):

    email = serializers.EmailField(max_length=150)

    def validate(self, attrs):
        email = attrs["email"]
        user = User.objects.get_or_none(email=email)

        if user is None:
            raise AuthenticationFailed("No user was found with this email.")

        validated_data = {
            "email": email,
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user)
        }

        return validated_data


class PasswordResetConfirmSerializer(Serializer):

    password = serializers.CharField(max_length=128, write_only=True)
    uidb64 = serializers.CharField(min_length=1, write_only=True)
    token = serializers.CharField(min_length=1, write_only=True)

    def validate(self, attrs):
        password = attrs["password"]
        uidb64 = attrs["uidb64"]
        token = attrs["token"]

        try:
            pk = urlsafe_base64_decode(uidb64).decode()
        except (UnicodeDecodeError, ValueError):
            raise ValidationError("Invalid password reset link.")

        user = User.objects.get_or_none(pk=pk)

        if not default_token_generator.check_token(user, token):
            raise ValidationError("Invalid password reset link.")

        user.set_password(password)
        user.save()

        return super(PasswordResetConfirmSerializer, self).validate(attrs)
