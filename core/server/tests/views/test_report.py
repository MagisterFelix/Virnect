from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Report, User
from core.server.tests import PATHS, REPORTS, USERS
from core.server.views import ReportListView, ReportView


class ReportListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)

    def test_get_reports(self):
        request = self.factory.get(path=PATHS["reports"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ReportListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

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


class ReportViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        admin = User.objects.create_superuser(**USERS["admin"])
        user = User.objects.create_user(**USERS["user"])
        Report.objects.create(sender=admin, suspect=user, **REPORTS["text abuse"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.report = Report.objects.get(pk=1)

    def test_get_report(self):
        request = self.factory.get(path=PATHS["report"], format="json")
        force_authenticate(request=request, user=self.admin)
        response = ReportView().as_view()(request, pk=self.report.id)

        self.assertEqual(response.status_code, 200)

    def test_review_report(self):
        data = {
            "verdict": 0
        }

        request = self.factory.patch(path=PATHS["report"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = ReportView().as_view()(request, pk=self.report.id)

        self.assertEqual(response.status_code, 200)

    def test_review_report_if_not_authenticated(self):
        data = {
            "verdict": 0
        }

        request = self.factory.patch(path=PATHS["topic"], data=data, format="multipart")
        response = ReportView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_review_report_if_not_exists(self):
        data = {
            "verdict": 0
        }

        request = self.factory.patch(path=PATHS["topic"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = ReportView().as_view()(request, pk=self.report.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_review_report_if_not_staff(self):
        data = {
            "verdict": 0
        }

        request = self.factory.post(path=PATHS["topic"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = ReportView().as_view()(request, pk=self.report.id)

        self.assertEqual(response.status_code, 403)
