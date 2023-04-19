import os
import random

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenBackendError


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
    def _get_response(request, message, status):
        view = APIView()
        view.headers = view.default_response_headers

        data = {
            "details": message
        }

        response = Response(data=data, status=status)

        return view.finalize_response(request, response).render()

    @staticmethod
    def get_user_id(token):
        if token is None:
            return None

        try:
            user_id = TokenBackend(
                algorithm=settings.SIMPLE_JWT["ALGORITHM"],
                signing_key=settings.SIMPLE_JWT["SIGNING_KEY"]
            ).decode(token)["user_id"]
        except TokenBackendError:
            return None

        return user_id

    @staticmethod
    def set_auth_cookies(response, data):
        cookies = []

        if data.get("access") is not None:
            cookies.append({
                "key": settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS_TOKEN"],
                "value": data["access"],
                "expires": timezone.now() + settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                "samesite": settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            })

        if data.get("refresh") is not None:
            cookies.append({
                "key": settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH_TOKEN"],
                "value": data.get("refresh"),
                "expires": timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                "samesite": settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            })

        for cookie in cookies:
            response.set_cookie(**cookie)

    @staticmethod
    def remove_auth_cookies(response):
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

    @staticmethod
    def get_invalid_csrftoken_response(request):
        message = "CSRF token is invalid or not provided."
        response = AuthorizationUtils._get_response(request, message, status.HTTP_403_FORBIDDEN)
        AuthorizationUtils.remove_auth_cookies(response)
        return response

    @staticmethod
    def get_missed_credentials_response(request):
        message = "Authentication credentials were not provided."
        response = AuthorizationUtils._get_response(request, message, status.HTTP_401_UNAUTHORIZED)
        return response

    @staticmethod
    def get_invalid_token_response(request):
        message = "Token is invalid or expired."
        response = AuthorizationUtils._get_response(request, message, status.HTTP_401_UNAUTHORIZED)
        AuthorizationUtils.remove_auth_cookies(response)
        return response


class WebSocketUtils:

    @staticmethod
    def _send_to_group(group, event):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(group, event)

    @staticmethod
    def update_notification_list(user_id):
        WebSocketUtils._send_to_group(
            f"notification-list-{user_id}",
            {
                "type": "notification_list_update"
            }
        )

    @staticmethod
    def update_room_list():
        WebSocketUtils._send_to_group(
            "room-list",
            {
                "type": "room_list_update"
            }
        )

    @staticmethod
    def update_room(room_id, room_title):
        WebSocketUtils._send_to_group(
            f"room-{room_id}",
            {
                "type": "room_update",
                "room": room_title
            }
        )

    @staticmethod
    def delete_room(room_id):
        WebSocketUtils._send_to_group(
            f"room-{room_id}",
            {
                "type": "room_delete"
            }
        )
