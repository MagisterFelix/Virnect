from rest_framework import status
from rest_framework.exceptions import MethodNotAllowed, NotFound
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.models.user import User
from core.server.serializers import UserSerializer


class UserView(APIView):

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get(self, request, username=None):
        user = User.objects.get_or_none(username=username) if username is not None else request.user

        if user is None or not user.is_active:
            raise NotFound()

        serializer = self.serializer_class(user)
        response = serializer.data

        username is not None and response.pop("email")

        return Response(response, status=status.HTTP_200_OK)

    def patch(self, request, username=None):
        if username is not None:
            raise MethodNotAllowed(request.method)

        serializer = self.serializer_class(request.user, data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        data = {}

        if serializer.validated_data.get("password") is None:
            data["details"] = "Profile has been successfully updated."
        else:
            data["details"] = "Password has been successfully changed."

        return Response(data, status=status.HTTP_200_OK)
