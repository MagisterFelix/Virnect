from django.test import TestCase
from rest_framework.test import APIRequestFactory

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views.auth import AuthorizationView, DeauthorizationView, RegistrationView


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
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertIn("access_token", response.cookies.keys())
        self.assertIn("refresh_token", response.cookies.keys())

    def test_authorization_with_email(self):
        data = {
            "username": USERS["user"]["email"],
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertIn("access_token", response.cookies.keys())
        self.assertIn("refresh_token", response.cookies.keys())

    def test_authorization_if_user_not_exists(self):
        data = {
            "username": USERS["test"]["username"],
            "password": USERS["test"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 403)

        self.assertEqual(len(response.cookies), 0)

    def test_authorization_without_username(self):
        data = {
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(len(response.cookies), 0)

    def test_authorization_without_password(self):
        data = {
            "username": USERS["user"]["username"],
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 400)

        self.assertEqual(len(response.cookies), 0)


class RegistrationViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_registration(self):
        request = self.factory.post(path=PATHS["sign-up"], data=USERS["test"], format="json")
        response = RegistrationView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_authorization_if_user_already_exists(self):
        request = self.factory.post(path=PATHS["sign-up"], data=USERS["user"], format="json")
        response = RegistrationView().as_view()(request)

        self.assertEqual(response.status_code, 400)

        fields = []
        for error in response.data["details"]:
            fields.extend(error.keys())

        self.assertIn("username", fields)
        self.assertIn("email", fields)

    def test_registration_without_username(self):
        data = {
            "email": USERS["test"]["email"],
            "password": USERS["test"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-up"], data=data, format="json")
        response = RegistrationView.as_view()(request)

        self.assertEqual(response.status_code, 400)

        fields = []
        for error in response.data["details"]:
            fields.extend(error.keys())

        self.assertIn("username", fields)

    def test_registration_without_email(self):
        data = {
            "username": USERS["test"]["username"],
            "password": USERS["test"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-up"], data=data, format="json")
        response = RegistrationView.as_view()(request)

        self.assertEqual(response.status_code, 400)

        fields = []
        for error in response.data["details"]:
            fields.extend(error.keys())

        self.assertIn("email", fields)

    def test_registration_without_password(self):
        data = {
            "username": USERS["test"]["username"],
            "email": USERS["test"]["email"]
        }

        request = self.factory.post(path=PATHS["sign-up"], data=data, format="json")
        response = RegistrationView.as_view()(request)

        self.assertEqual(response.status_code, 400)

        fields = []
        for error in response.data["details"]:
            fields.extend(error.keys())

        self.assertIn("password", fields)


class DeauthorizationViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        data = {
            "username": USERS["user"]["username"],
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.auth_header = {
            "HTTP_AUTHORIZATION": f"Bearer {response.cookies.get('access_token').value}"
        }

    def test_deauthorization(self):
        request = self.factory.post(path=PATHS["sign-out"], format="json", **self.auth_header)
        response = DeauthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 204)

        self.assertEqual(len(response.cookies.get("access_token").value), 0)
        self.assertEqual(len(response.cookies.get("refresh_token").value), 0)
