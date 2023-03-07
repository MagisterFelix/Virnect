from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views.user import ProfileView, UserView


class ProfileViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=1)

    def test_getting_profile(self):
        request = self.factory.get(path=PATHS["profile"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "avatar", "about", "is_superuser",
                  "username", "is_staff", "is_active", "last_seen"]

        self.assertEqual(fields, list(response.data.keys()))


class UserViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=1)

    def test_getting_user(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=USERS["user"]["username"])

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "avatar", "about", "is_superuser",
                  "username", "is_staff", "is_active", "last_seen"]

        self.assertEqual(fields, list(response.data.keys()))

    def test_getting_user_if_not_exists(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=USERS["test"]["username"])

        self.assertEqual(response.status_code, 404)
