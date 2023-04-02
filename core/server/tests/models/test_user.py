from datetime import datetime

from django.contrib.auth.models import update_last_login
from django.db.models.fields.files import FieldFile
from django.db.utils import IntegrityError
from django.test import TestCase

from core.server.models import User
from core.server.tests import USERS


class UserTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])

    def test_user_fields(self):
        user = User.objects.get(id=2)
        update_last_login(None, user)
        user.update_last_seen()

        self.assertIsInstance(user.username, str)
        self.assertEqual(user.username, USERS["user"]["username"])
        self.assertEqual(user._meta.get_field("username").max_length, 150)

        self.assertIsInstance(user.first_name, str)
        self.assertEqual(user._meta.get_field("first_name").max_length, 150)

        self.assertIsInstance(user.last_name, str)
        self.assertEqual(user._meta.get_field("last_name").max_length, 150)

        self.assertIsInstance(user.email, str)
        self.assertEqual(user.email, USERS["user"]["email"])
        self.assertEqual(user._meta.get_field("email").max_length, 150)

        self.assertEqual(user.check_password(USERS["user"]["password"]), True)

        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        self.assertIsInstance(user.last_login, datetime)
        self.assertIsInstance(user.last_seen, datetime)
        self.assertIsInstance(user.date_joined, datetime)

        self.assertIsInstance(user.image, FieldFile)
        self.assertIn("static/avatars", user.image.url)

        self.assertIsInstance(user.about, str)
        self.assertEqual(user._meta.get_field("about").max_length, 1024)

    def test_superuser_fields(self):
        user = User.objects.get(id=1)

        self.assertEqual(user.username, USERS["admin"]["username"])
        self.assertEqual(user.email, USERS["admin"]["email"])
        self.assertEqual(user.check_password(USERS["admin"]["password"]), True)

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_creation_without_data(self):
        with self.assertRaises(TypeError):
            User.objects.create_user()

    def test_user_creation_with_invalid_data(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(username="", email="", password="")

    def test_user_creation_with_non_unique_username(self):
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username=USERS["admin"]["username"],
                email=USERS["test"]["email"],
                password=USERS["test"]["password"]
            )

    def test_user_creation_with_non_unique_email(self):
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username=USERS["test"]["username"],
                email=USERS["admin"]["email"],
                password=USERS["test"]["password"]
            )
