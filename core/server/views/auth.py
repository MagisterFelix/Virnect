from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.serializers import AuthorizationSerializer, RegistrationSerializer
from core.server.utils import AuthorizationUtils


class AuthorizationView(APIView):

    serializer_class = AuthorizationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)

        response, _ = AuthorizationUtils.get_success_authorization_response(
            request=request,
            validated_data=serializer.validated_data
        )

        return response


class RegistrationView(APIView):

    serializer_class = RegistrationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        data = {
            "details": "User has been successfully registered."
        }

        return Response(data=data, status=status.HTTP_201_CREATED)
