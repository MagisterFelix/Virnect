from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Message, Room, Topic, User
from core.server.tests import MESSAGES, PATHS, ROOMS, TOPICS, USERS
from core.server.views import MessageListView, MessageView


class MessageListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        host = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=host, topic=topic, **ROOMS["only english"])
        Message.objects.create(room=room, author=host, **MESSAGES["greetings"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.room = Room.objects.get(pk=1)
        self.message = Message.objects.get(pk=1)

    def test_get_messages(self):
        request = self.factory.get(path=PATHS["messages"], format="json")
        force_authenticate(request=request, user=self.user)
        response = MessageListView().as_view()(request, room=self.room.title)

        self.assertEqual(response.status_code, 200)

    def test_create_message(self):
        data = {
            "text": MESSAGES["greetings"]["text"]
        }

        request = self.factory.post(path=PATHS["messages"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = MessageListView().as_view()(request, room=self.room.title)

        self.assertEqual(response.status_code, 201)

    def test_create_message_if_not_authenticated(self):
        data = {
            "text": MESSAGES["greetings"]["text"]
        }

        request = self.factory.post(path=PATHS["messages"], data=data, format="multipart")
        response = MessageListView().as_view()(request, room=self.room.title)

        self.assertEqual(response.status_code, 403)

    def test_create_message_if_room_not_exists(self):
        data = {
            "text": MESSAGES["greetings"]["text"]
        }

        request = self.factory.post(path=PATHS["messages"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = MessageListView().as_view()(request, room=self.room.title + "1")

        self.assertEqual(response.status_code, 404)


class MessageViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create(**USERS["admin"])
        host = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=host, topic=topic, **ROOMS["only english"])
        Message.objects.create(room=room, author=host, **MESSAGES["greetings"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.room = Room.objects.get(pk=1)
        self.message = Message.objects.get(pk=1)

    def test_get_message(self):
        request = self.factory.get(path=PATHS["message"], format="json")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 200)

    def test_update_message(self):
        data = {
            "text": MESSAGES["reply"]["text"]
        }

        request = self.factory.patch(path=PATHS["message"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 200)

    def test_update_message_if_not_authenticated(self):
        data = {
            "text": MESSAGES["reply"]["text"]
        }

        request = self.factory.patch(path=PATHS["message"], data=data, format="multipart")
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 403)

    def test_update_message_if_room_not_exists(self):
        data = {
            "text": MESSAGES["reply"]["text"]
        }

        request = self.factory.patch(path=PATHS["message"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title + "1", pk=self.message.id)

        self.assertEqual(response.status_code, 404)

    def test_update_message_if_not_exists(self):
        data = {
            "text": MESSAGES["reply"]["text"]
        }

        request = self.factory.patch(path=PATHS["message"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_update_message_if_not_owner(self):
        data = {
            "text": MESSAGES["reply"]["text"]
        }

        request = self.factory.post(path=PATHS["message"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 403)

    def test_delete_message(self):
        request = self.factory.delete(path=PATHS["message"], format="json")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 204)

    def test_delete_message_if_not_authenticated(self):
        request = self.factory.delete(path=PATHS["message"], format="json")
        response = MessageView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_delete_message_if_room_not_exists(self):
        request = self.factory.delete(path=PATHS["message"], format="json")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title + "1", pk=self.message.id)

        self.assertEqual(response.status_code, 404)

    def test_delete_message_if_not_exists(self):
        request = self.factory.delete(path=PATHS["message"], format="json")
        force_authenticate(request=request, user=self.user)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_delete_message_if_not_owner(self):
        request = self.factory.delete(path=PATHS["message"], format="json")
        force_authenticate(request=request, user=self.admin)
        response = MessageView().as_view()(request, room=self.room.title, pk=self.message.id)

        self.assertEqual(response.status_code, 403)
