from smtplib import SMTPException

from django.conf import settings
from django.contrib.auth import logout
from django.core.mail import send_mail
from django.middleware.csrf import rotate_token
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.serializers import (AuthorizationSerializer, DeauthorizationSerializer,
                                     PasswordResetConfirmSerializer, PasswordResetSerializer, RegistrationSerializer)
from core.server.utils import AuthorizationUtils


class AuthorizationView(APIView):

    serializer_class = AuthorizationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        rotate_token(request)

        response = Response(data=serializer.data, status=status.HTTP_200_OK)
        AuthorizationUtils.set_auth_cookies(response, serializer.validated_data)

        return response


class DeauthorizationView(APIView):

    serializer_class = DeauthorizationSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = self.serializer_class(instance=request.user)

        request.COOKIES.get("sessionid") and logout(request)

        response = Response(data=serializer.data, status=status.HTTP_204_NO_CONTENT)
        AuthorizationUtils.remove_auth_cookies(response)

        return response


class RegistrationView(APIView):

    serializer_class = RegistrationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(data=serializer.data, status=status.HTTP_201_CREATED)


class PasswordResetView(APIView):

    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email_template_name = "password_reset_email.txt"
        context = {
            "protocol": request.scheme,
            "domain": request.META["HTTP_HOST"],
            "url": request.META["HTTP_HOST"],
            "uidb64": serializer.validated_data["uidb64"],
            "token": serializer.validated_data["token"]
        }
        message = render_to_string(email_template_name, context)

        try:
            send_mail(
                subject="Password reset",
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[serializer.validated_data["email"]],
                fail_silently=False,
            )
        except SMTPException:
            data = {
                "details": "Email was not sent."
            }
            return Response(data=data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data=serializer.data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (AllowAny,)

    def post(self, request, uidb64, token):
        data = request.data.copy()

        data["uidb64"] = uidb64
        data["token"] = token

        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
