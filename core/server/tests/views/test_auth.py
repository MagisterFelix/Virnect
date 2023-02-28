from django.test import TestCase
from rest_framework.test import APIRequestFactory

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views.auth import AuthorizationView


class AuthorizationViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_authorization_with_username(self):
        data = {
            "username": USERS["user"]["username"],
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertIn("access_token", response.cookies.keys())
        self.assertIn("refresh_token", response.cookies.keys())

    def test_authorization_with_email(self):
        data = {
            "username": USERS["user"]["email"],
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertIn("access_token", response.cookies.keys())
        self.assertIn("refresh_token", response.cookies.keys())

    def test_authorization_if_user_not_exists(self):
        data = {
            "username": USERS["test"]["username"],
            "password": USERS["test"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView.as_view()(request)

        self.assertEqual(response.status_code, 403)

        self.assertEqual(len(response.cookies), 0)

    def test_authorization_without_username(self):
        data = {
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView.as_view()(request)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(len(response.cookies), 0)

    def test_authorization_without_password(self):
        data = {
            "username": USERS["user"]["username"],
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView.as_view()(request)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(len(response.cookies), 0)
