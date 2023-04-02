from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, REPORTS, USERS
from core.server.views import ReportView


class ReportViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(id=1)
        self.user = User.objects.get(id=2)

    def test_reporting_user(self):
        data = {
            "sender": self.admin.id,
            "suspect": self.user.id,
            "reason": REPORTS["text abuse"]["reason"]
        }

        request = self.factory.post(path=PATHS["report"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_reporting_user_without_sender(self):
        data = {
            "suspect": self.user.id,
            "reason": REPORTS["text abuse"]["reason"]
        }

        request = self.factory.post(path=PATHS["report"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_reporting_user_without_suspect(self):
        data = {
            "sender": self.admin.id,
            "reason": REPORTS["text abuse"]["reason"]
        }

        request = self.factory.post(path=PATHS["report"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_reporting_user_without_reason(self):
        data = {
            "suspect": self.user.id,
            "sender": self.admin.id
        }

        request = self.factory.post(path=PATHS["report"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_reporting_user_with_invalid_reason(self):
        data = {
            "suspect": self.user.id,
            "sender": self.admin.id,
            "reason": "invalid"
        }

        request = self.factory.post(path=PATHS["report"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 400)
