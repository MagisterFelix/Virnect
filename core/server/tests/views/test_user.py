from django.test import TestCase
from rest_framework.test import APIRequestFactory

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views.auth import AuthorizationView
from core.server.views.user import ProfileView


class ProfileViewTest(TestCase):

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

    def test_getting_profile(self):
        request = self.factory.get(path=PATHS["profile"], format="json", **self.auth_header)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        fields = ["id", "full_name", "avatar", "last_login", "is_superuser", "username",
                  "is_staff", "is_active", "date_joined", "email", "last_seen", "about"]

        self.assertEqual(fields, list(response.data.keys()))
