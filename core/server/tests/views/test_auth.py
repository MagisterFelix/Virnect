from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views import AuthorizationView, DeauthorizationView, RegistrationView


class AuthorizationViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])
        User.objects.create_user(is_active=False, **USERS["test"])

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
            "username": USERS["admin"]["username"],
            "password": USERS["admin"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 403)

        self.assertEqual(len(response.cookies), 0)

    def test_authorization_if_user_blocked(self):
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


class RegistrationViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_registration(self):
        request = self.factory.post(path=PATHS["sign-up"], data=USERS["test"], format="json")
        response = RegistrationView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_registration_if_user_already_exists(self):
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


class DeauthorizationViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)

    def test_deauthorization(self):
        request = self.factory.post(path=PATHS["sign-out"], format="json")
        force_authenticate(request=request, user=self.user)
        response = DeauthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 204)

        self.assertEqual(len(response.cookies.get("access_token").value), 0)
        self.assertEqual(len(response.cookies.get("refresh_token").value), 0)

    def test_deauthorization_if_not_authenticated(self):
        request = self.factory.post(path=PATHS["sign-out"], format="json")
        response = DeauthorizationView().as_view()(request)

        self.assertEqual(response.status_code, 403)
