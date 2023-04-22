from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Message, Notification, Room, Topic, User
from core.server.tests import MESSAGES, NOTIFICATIONS, PATHS, ROOMS, TOPICS, USERS
from core.server.views import NotificationListView, NotificationView


class NotificationListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])
        Message.objects.create(room=room, author=user, **MESSAGES["greetings"])
        Notification.objects.create(recipient=user, **NOTIFICATIONS["message reply"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.notification = Notification.objects.get(pk=1)

    def test_get_notifications(self):
        request = self.factory.get(path=PATHS["notifications"], format="json")
        force_authenticate(request=request, user=self.user)
        response = NotificationListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_get_notifications_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["notifications"], format="json")
        response = NotificationListView().as_view()(request)

        self.assertEqual(response.status_code, 403)


class NotificationViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])
        Message.objects.create(room=room, author=user, **MESSAGES["greetings"])
        Notification.objects.create(recipient=user, **NOTIFICATIONS["message reply"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.notification = Notification.objects.get(pk=1)

    def test_get_notification(self):
        request = self.factory.get(path=PATHS["notification"], format="json")
        force_authenticate(request=request, user=self.user)
        response = NotificationView().as_view()(request, pk=self.notification.id)

        self.assertEqual(response.status_code, 200)

    def test_get_notification_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["notification"], format="json")
        response = NotificationView().as_view()(request, pk=self.notification.id)

        self.assertEqual(response.status_code, 403)

    def test_update_notification(self):
        data = {
            "is_viewed": True
        }

        request = self.factory.patch(path=PATHS["notification"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = NotificationView().as_view()(request, pk=self.notification.id)

        self.assertEqual(response.status_code, 200)

    def test_update_notification_if_not_authenticated(self):
        data = {
            "is_viewed": True
        }

        request = self.factory.patch(path=PATHS["notification"], data=data, format="multipart")
        response = NotificationView().as_view()(request, pk=self.notification.id)

        self.assertEqual(response.status_code, 403)

    def test_update_notification_if_not_exists(self):
        data = {
            "is_viewed": True
        }

        request = self.factory.patch(path=PATHS["notification"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = NotificationView().as_view()(request, pk=self.notification.id + 1)

        self.assertEqual(response.status_code, 404)
