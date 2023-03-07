from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.server.models.user import User
from core.server.serializers import UserSerializer


class ProfileView(RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def retrieve(self, request):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserView(RetrieveAPIView):

    lookup_field = "username"
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
