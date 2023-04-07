from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from core.server.models import User
from core.server.serializers import ProfileSerializer, UserSerializer


class ProfileView(RetrieveUpdateAPIView):

    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get_object(self):
        queryset = self.get_queryset()

        obj = get_object_or_404(queryset, pk=self.request.user.id)
        self.check_object_permissions(self.request, obj)

        return obj

    def get_serializer_context(self):
        context = super(ProfileView, self).get_serializer_context()

        if self.request.data.get("password") is None and self.request.data.get("new_password") is None:
            context["action"] = "update"
        else:
            context["action"] = "change"

        return context


class UserView(RetrieveAPIView):

    lookup_field = "username"
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def retrieve(self, request, *args, **kwargs):
        response = super(UserView, self).retrieve(request, *args, **kwargs)

        if not response.data["is_active"]:
            raise NotFound("No user was found.")

        response.data.pop("email")

        return response
