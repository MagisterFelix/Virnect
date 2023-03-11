from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.models.user import User
from core.server.serializers import ProfileSerializer, UserSerializer


class ProfileView(APIView):

    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = self.serializer_class(request.user, data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        data = {}

        if serializer.validated_data.get("password") is None:
            data["details"] = "Profile has been successfully updated."
        else:
            data["details"] = "Password has been successfully changed."

        return Response(data, status=status.HTTP_200_OK)


class UserView(RetrieveAPIView):

    lookup_field = "username"
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
