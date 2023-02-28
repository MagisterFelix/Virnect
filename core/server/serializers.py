from django.db.models import Q
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class AuthorizationSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        attr = attrs["username"]
        user = User.objects.get_or_none(Q(username=attr) | Q(email=attr))

        if user is not None:
            attrs["username"] = user.username

        return super(AuthorizationSerializer, self).validate(attrs)
