from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, USERS
from core.server.views import AuthorizationView, ProfileView, UserView


class ProfileViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        User.objects.create_user(is_active=False, **USERS["test"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=2)
        self.test = User.objects.get(pk=3)

    def test_get_profile(self):
        request = self.factory.get(path=PATHS["profile"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "is_superuser", "username", "first_name", "last_name",
                  "is_staff", "is_active", "email", "last_seen", "image", "about", "notifications"]

        self.assertEqual(fields, list(response.data.keys()))

    def test_get_profile_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["profile"], format="json")
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_get_profile_if_blocked(self):
        data = {
            "username": USERS["user"]["username"],
            "password": USERS["user"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        request = self.factory.get(path=PATHS["profile"], format="json")
        request.COOKIES = response.cookies
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_profile(self):
        data = {
            "email": "new_email@email.com",
            "first_name": "First name",
            "last_name": "Last name"
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_update_profile_if_not_authenticated(self):
        data = {
            "email": "new_email@email.com",
            "first_name": "First name",
            "last_name": "Last name"
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_profile_if_email_exists(self):
        data = {
            "email": USERS["admin"]["email"],
            "first_name": "First name",
            "last_name": "Last name"
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_update_password(self):
        data = {
            "password": USERS["user"]["password"],
            "new_password": USERS["test"]["password"]
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_update_password_if_not_authenticated(self):
        data = {
            "password": USERS["user"]["password"],
            "new_password": USERS["test"]["password"]
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_password_if_password_mismatch(self):
        data = {
            "password": USERS["admin"]["password"],
            "new_password": USERS["test"]["password"]
        }

        request = self.factory.patch(path=PATHS["profile"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 400)


class UserViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"], is_active=False)

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.test = User.objects.get(pk=3)

    def test_get_user(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=self.user.username)

        self.assertEqual(response.status_code, 200)

        fields = ["id", "online", "full_name", "is_superuser", "username", "first_name", "last_name",
                  "is_staff", "is_active", "last_seen", "image", "about"]

        self.assertEqual(fields, list(response.data.keys()))

    def test_get_user_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        response = UserView().as_view()(request, username=self.user.username)

        self.assertEqual(response.status_code, 403)

    def test_get_user_if_not_exists(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username="undefined")

        self.assertEqual(response.status_code, 404)

    def test_get_user_if_blocked(self):
        request = self.factory.get(path=PATHS["user"], format="json")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=self.test.username)

        self.assertEqual(response.status_code, 404)

    def test_update_user(self):
        data = {
            "is_staff": True
        }

        request = self.factory.patch(path=PATHS["user"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_update_user_if_not_authenticated(self):
        data = {
            "is_staff": True
        }

        request = self.factory.patch(path=PATHS["user"], data=data, format="multipart")
        response = ProfileView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_user_if_not_exists(self):
        data = {
            "is_staff": True
        }

        request = self.factory.patch(path=PATHS["user"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = UserView().as_view()(request, username="undefined")

        self.assertEqual(response.status_code, 404)

    def test_update_user_if_not_staff(self):
        data = {
            "is_staff": True
        }

        request = self.factory.patch(path=PATHS["user"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = UserView().as_view()(request, username=self.user.username)

        self.assertEqual(response.status_code, 403)

    def test_update_user_if_blocked(self):
        data = {
            "username": USERS["admin"]["username"],
            "password": USERS["admin"]["password"]
        }

        request = self.factory.post(path=PATHS["sign-in"], data=data, format="json")
        response = AuthorizationView().as_view()(request)

        self.admin.is_active = False
        self.admin.save()

        data = {
            "is_staff": True
        }

        request = self.factory.patch(path=PATHS["user"], data=data, format="multipart")
        request.COOKIES = response.cookies
        response = UserView().as_view()(request, username=self.user.username)

        self.assertEqual(response.status_code, 403)
