import os
import random

from django.conf import settings
from django.core.exceptions import ValidationError
from django.middleware.csrf import rotate_token
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class ImageUtils:

    @staticmethod
    def get_default_avatar():
        images = os.listdir(os.path.join(settings.STATIC_DIR, "avatars"))
        return "../static/avatars/" + random.choice(images)

    @staticmethod
    def validate_image_file_extension(file):
        valid_extensions = [".jpg", ".jpeg", ".png", ".svg"]
        extension = os.path.splitext(file.name)[1]

        if not extension.lower() in valid_extensions:
            raise ValidationError("The file uploaded either not an image or a corrupted image.")

    @staticmethod
    def upload_image_to(instance, filename):
        attrs = dir(instance)

        if "username" in attrs:
            folder, title = "users", instance.username
        elif "name" in attrs:
            folder, title = "languages", instance.name.lower().replace(" ", "_")
        else:
            folder, title = "topics", instance.title.lower().replace(" ", "_")

        directory = os.path.join(settings.MEDIA_ROOT, f"{folder}")

        if not os.path.exists(directory):
            os.makedirs(directory)

        for file in os.listdir(directory):
            if os.path.splitext(file)[0] == title:
                os.remove(os.path.join(settings.MEDIA_ROOT, f"{folder}/{file}"))

        return f"{folder}/{title}{os.path.splitext(filename)[-1]}"

    @staticmethod
    def remove_image_from(instance):
        attrs = dir(instance)

        if "icon" in attrs:
            path = instance.icon.name
        else:
            path = instance.image.name

        file = os.path.join(settings.MEDIA_ROOT, f"{path}")

        if not os.path.exists(file) or "static" in path:
            return None

        os.remove(file)


class AuthorizationUtils:

    @staticmethod
    def _get_response(request, message, status, cookies=None):
        view = APIView()
        view.headers = view.default_response_headers

        data = {
            "details": message
        }

        response = Response(data=data, status=status)

        if cookies is not None:
            for cookie in cookies:
                response.set_cookie(**cookie)

        return response, view.finalize_response(request, response).render()

    @staticmethod
    def remove_auth_cookies(response):
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

    @staticmethod
    def get_missed_credentials_response(request):
        message = "Authentication credentials were not provided."
        _, response = AuthorizationUtils._get_response(request, message, status.HTTP_401_UNAUTHORIZED)
        return response

    @staticmethod
    def get_invalid_token_response(request):
        message = "Token is invalid or expired."
        _, response = AuthorizationUtils._get_response(request, message, status.HTTP_401_UNAUTHORIZED)
        AuthorizationUtils.remove_auth_cookies(response)
        return response

    @staticmethod
    def get_success_authorization_response(request, validated_data):
        rotate_token(request)
        message = "User has been successfully authorized."
        cookies = [
            {
                "key": settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS_TOKEN"],
                "value": validated_data.get("access"),
                "expires": timezone.now() + settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                "samesite": settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            },
            {
                "key": settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH_TOKEN"],
                "value": validated_data.get("refresh"),
                "expires": timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                "samesite": settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            }
        ]
        return AuthorizationUtils._get_response(request, message, status.HTTP_200_OK, cookies)
