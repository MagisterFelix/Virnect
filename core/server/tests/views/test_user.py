from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views import UserView


class UserViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"], is_active=False)

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=2)

    def test_getting_profile(self):
        request = self.factory.get(path=PATHS["profile"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "is_superuser", "username", "first_name", "last_name",
                  "is_staff", "is_active", "email", "last_seen", "image", "about"]

        self.assertEqual(fields, list(response.data.keys()))

    def test_updating_profile(self):
        data = {
            "email": "new_email@email.com",
            "first_name": "First name",
            "last_name": "Last name"
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_updating_profile_if_email_exists(self):
        data = {
            "email": USERS["admin"]["email"],
            "first_name": "First name",
            "last_name": "Last name"
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_changing_password(self):
        data = {
            "password": USERS["user"]["password"],
            "new_password": USERS["test"]["password"]
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_changing_password_if_password_mismatch(self):
        data = {
            "password": USERS["admin"]["password"],
            "new_password": USERS["test"]["password"]
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_getting_user(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=USERS["user"]["username"])

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "is_superuser", "username", "first_name", "last_name",
                  "is_staff", "is_active", "last_seen", "image", "about"]

        self.assertEqual(fields, list(response.data.keys()))

    def test_getting_user_if_not_exists(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username="undefined")

        self.assertEqual(response.status_code, 404)

    def test_getting_user_if_blocked(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=USERS["test"]["username"])

        self.assertEqual(response.status_code, 404)
