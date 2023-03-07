from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

from core.server.utils import ImageUtils

from .base import BaseManager


class UserManager(BaseUserManager, BaseManager):

    def create_user(self, username, email, password, **extra_fields):
        if username is None or username == "":
            raise ValueError("Users must have an username.")

        if email is None or email == "":
            raise ValueError("Users must have an email.")

        if password is None or password == "":
            raise ValueError("Users must have a password.")

        user = self.model(
            username=username,
            email=self.normalize_email(email),
            **extra_fields
        )
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser, PermissionsMixin):

    email = models.EmailField(
        max_length=150,
        unique=True,
        blank=False,
        null=False,
        error_messages={
            "unique": "A user with this email already exists.",
        })
    last_seen = models.DateTimeField(null=True, blank=True)
    image = models.FileField(default=ImageUtils.get_default_avatar,
                             upload_to=ImageUtils.upload_image_to,
                             validators=[ImageUtils.validate_image_file_extension])
    about = models.TextField(max_length=1024, blank=True)

    objects = UserManager()

    @property
    def is_online(self):
        if self.last_seen is None:
            return False
        return timezone.now() <= self.last_seen + settings.USER_ONLINE_TIMEOUT

    @property
    def about_user(self):
        if len(self.about) == 0:
            return f"We don't know much about {self.username}, but we're sure {self.username} is great."
        return self.about

    def update_last_seen(self):
        if not self.pk:
            return None

        self.last_seen = timezone.now()
        self.save(update_fields=["last_seen"])

    def delete(self, *args, **kwargs):
        ImageUtils.remove_image_from(self)
        super(User, self).delete(*args, **kwargs)

    def __str__(self):
        return self.username

    class Meta:
        db_table = "user"
