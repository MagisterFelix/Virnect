from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.server.serializers import UserSerializer


class ProfileView(RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def retrieve(self, request):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
