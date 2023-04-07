from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import User
from core.server.tests import PATHS, REPORTS, USERS
from core.server.views import ReportListView


class ReportListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)

    def test_create_report(self):
        data = {
            "sender": self.admin.id,
            "suspect": self.user.id,
            "reason": REPORTS["text abuse"]["reason"]
        }

        request = self.factory.post(path=PATHS["reports"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportListView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_create_report_if_no_reason(self):
        data = {
            "suspect": self.user.id,
            "sender": self.admin.id
        }

        request = self.factory.post(path=PATHS["reports"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportListView().as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_create_report_if_invalid_reason(self):
        data = {
            "suspect": self.user.id,
            "sender": self.admin.id,
            "reason": "invalid"
        }

        request = self.factory.post(path=PATHS["reports"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportListView().as_view()(request)

        self.assertEqual(response.status_code, 400)
