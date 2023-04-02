from datetime import datetime

from django.test import TestCase

from core.server.models import Report, User
from core.server.tests import REPORTS, USERS


class ReportTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["admin"])
        sender = User.objects.create_user(**USERS["user"])
        suspect = User.objects.create_user(**USERS["test"])

        Report.objects.create(sender=sender, suspect=suspect, **REPORTS["text abuse"])

    def test_report_fields(self):
        report = Report.objects.get(id=1)

        self.assertIsInstance(report.sender, User)
        self.assertEqual(report.sender.username, USERS["user"]["username"])

        self.assertIsInstance(report.suspect, User)
        self.assertEqual(report.suspect.username, USERS["test"]["username"])

        self.assertIsInstance(report.reason, int)
        self.assertEqual(report.reason, REPORTS["text abuse"]["reason"])

        self.assertIsInstance(report.verdict, int)
        self.assertEqual(report.verdict, Report.Verdict.NO_VERDICT)

        self.assertIsNone(report.reviewed_by)

        self.assertIsInstance(report.created_at, datetime)

        self.assertIsInstance(report.is_viewed, bool)
        self.assertFalse(report.is_viewed)

    def test_report_setting_is_viewed_on_verdict(self):
        report = Report.objects.get(id=1)

        self.assertFalse(report.is_viewed)

        report.verdict = Report.Verdict.WARNING
        report.save()

        self.assertTrue(report.is_viewed)

    def test_report_removing_on_deleting_sender(self):
        before_deleting = Report.objects.count()
        User.objects.get(id=2).delete()
        after_deleting = Report.objects.count()

        self.assertGreater(before_deleting, after_deleting)

    def test_report_removing_on_deleting_suspect(self):
        before_deleting = Report.objects.count()
        User.objects.get(id=3).delete()
        after_deleting = Report.objects.count()

        self.assertGreater(before_deleting, after_deleting)

    def test_report_setting_to_none_on_deleting_moderator_who_reviewed(self):
        before_deleting = Report.objects.count()
        User.objects.get(id=1).delete()
        after_deleting = Report.objects.count()

        self.assertEqual(before_deleting, after_deleting)
