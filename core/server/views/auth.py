from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.serializers import (AuthorizationSerializer, PasswordResetConfirmSerializer, PasswordResetSerializer,
                                     RegistrationSerializer)
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


class PasswordResetView(APIView):

    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = {}

        email_template_name = "password_reset_email.txt"
        context = {
            "protocol": request.scheme,
            "domain": request.META["HTTP_HOST"],
            "url": request.META["HTTP_HOST"],
            "uid": serializer.validated_data["uid"],
            "token": serializer.validated_data["token"]
        }

        try:
            send_mail(
                subject="Password reset",
                message=render_to_string(email_template_name, context),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[serializer.validated_data["email"]],
                fail_silently=False,
            )
            data["details"] = "Email has been sent."
        except SMTPException:
            data["details"] = "Email was not sent."
            return Response(data=data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data=data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (AllowAny,)

    def post(self, request, uid, token):
        data = request.data.copy()

        data["uid"] = uid
        data["token"] = token

        serializer = self.serializer_class(data=data)

        serializer.is_valid(raise_exception=True)

        data = {
            "details": "Password has been reset."
        }

        return Response(data=data, status=status.HTTP_200_OK)
