from rest_framework import status
from rest_framework.exceptions import MethodNotAllowed, NotFound
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.models.user import User
from core.server.serializers.user import UserSerializer


class UserView(APIView):

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, MultiPartParser,)

    def get(self, request, username=None):
        user = User.objects.get_or_none(username=username) if username is not None else request.user

        if user is None or not user.is_active:
            raise NotFound("No user was found.")

        serializer = self.serializer_class(instance=user)
        data = serializer.data
        username is not None and data.pop("email")

        return Response(data=data, status=status.HTTP_200_OK)

    def patch(self, request, username=None):
        if username is not None:
            raise MethodNotAllowed(request.method)

        context = {
            "action": "update" if request.data.get("password") is None else "change"
        }

        serializer = self.serializer_class(instance=request.user, data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)
