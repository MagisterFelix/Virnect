from datetime import datetime

from django.test import TestCase

from core.server.models import Notification, User
from core.server.tests import NOTIFICATIONS, USERS


class NotificationTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        recipient = User.objects.create_user(**USERS["user"])

        Notification.objects.create(recipient=recipient, **NOTIFICATIONS["message reply"])

    def test_notification_fields(self):
        notification = Notification.objects.get(id=1)

        self.assertIsInstance(notification.recipient, User)
        self.assertEqual(notification.recipient.username, USERS["user"]["username"])

        self.assertIsInstance(notification.notification_type, int)
        self.assertEqual(notification.notification_type, NOTIFICATIONS["message reply"]["notification_type"])

        self.assertIsInstance(notification.content, str)
        self.assertEqual(notification.content, NOTIFICATIONS["message reply"]["content"])
        self.assertEqual(notification._meta.get_field("content").max_length, 128)

        self.assertIsInstance(notification.created_at, datetime)

        self.assertIsInstance(notification.is_viewed, bool)
        self.assertFalse(notification.is_viewed)

    def test_notification_removing_on_deleting_recipient(self):
        before_deleting = Notification.objects.count()
        User.objects.get(id=1).delete()
        after_deleting = Notification.objects.count()

        self.assertGreater(before_deleting, after_deleting)
