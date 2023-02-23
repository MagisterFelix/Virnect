import os
import random

from django.conf import settings
from django.core.exceptions import ValidationError


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
        if "username" in dir(instance):
            folder, title = "users", instance.username
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
        path = instance.image.name
        file = os.path.join(settings.MEDIA_ROOT, f"{path}")

        if not os.path.exists(file) or "static" in path:
            return None

        os.remove(file)
