from datetime import datetime

from django.test import TestCase

from core.server.models import History, User
from core.server.tests import HISTORIES, USERS


class HistoryTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        owner = User.objects.create_user(**USERS["user"])

        History.objects.create(owner=owner, **HISTORIES["1970-01-01T00:00:00.0"])

    def test_history_fields(self):
        history = History.objects.get(pk=1)

        self.assertIsInstance(history.owner, User)
        self.assertEqual(history.owner.username, USERS["user"]["username"])

        self.assertIsInstance(history.topic, str)
        self.assertEqual(history.topic, HISTORIES["1970-01-01T00:00:00.0"]["topic"])
        self.assertEqual(history._meta.get_field("topic").max_length, 64)

        self.assertIsInstance(history.tags, str)
        self.assertEqual(history.tags, HISTORIES["1970-01-01T00:00:00.0"]["tags"])
        self.assertEqual(history._meta.get_field("tags").max_length, 64)

        self.assertIsInstance(history.language, str)
        self.assertEqual(history.language, HISTORIES["1970-01-01T00:00:00.0"]["language"])
        self.assertEqual(history._meta.get_field("language").max_length, 32)

        self.assertIsInstance(history.recorded_at, datetime)

    def test_history_removing_on_deleting_owner(self):
        before_deleting = History.objects.count()
        User.objects.get(pk=1).delete()
        after_deleting = History.objects.count()

        self.assertGreater(before_deleting, after_deleting)
