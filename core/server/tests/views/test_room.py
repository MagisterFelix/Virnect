from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Room, Topic, User
from core.server.tests import PATHS, ROOMS, TOPICS, USERS
from core.server.views import ConnectingView, DisconnectingView, RoomListView, RoomView


class RoomListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.test = User.objects.get(pk=2)
        self.topic = Topic.objects.get(pk=1)
        self.room = Room.objects.get(pk=1)

    def test_get_rooms(self):
        request = self.factory.get(path=PATHS["rooms"], format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_create_room(self):
        data = {
            "host": self.user.id,
            "title": ROOMS["only english"]["title"],
            "topic": self.topic.id
        }

        request = self.factory.post(path=PATHS["rooms"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomListView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_create_room_if_not_authenticated(self):
        data = {
            "host": self.user.id,
            "title": ROOMS["only english"]["title"],
            "topic": self.topic.id
        }

        request = self.factory.post(path=PATHS["rooms"], data=data, format="json")
        response = RoomListView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_create_room_if_user_already_has_five_rooms(self):
        for i in range(4):
            data = {
                "host": self.user.id,
                "title": f"room#{i}",
                "topic": self.topic.id,
            }

            request = self.factory.post(path=PATHS["rooms"], data=data, format="json")
            force_authenticate(request=request, user=self.user)
            response = RoomListView().as_view()(request)

        data = {
            "host": self.user.id,
            "title": ROOMS["only english"]["title"],
            "topic": self.topic.id
        }

        request = self.factory.post(path=PATHS["rooms"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomListView().as_view()(request)

        self.assertEqual(response.status_code, 403)


class RoomViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.test_user = User.objects.get(pk=2)
        self.topic = Topic.objects.get(pk=1)
        self.room = Room.objects.get(pk=1)

    def test_get_room(self):
        request = self.factory.get(path=PATHS["room"], format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 200)

    def test_update_room(self):
        data = {
            "title": ROOMS["only english"]["title"],
            "topic": self.topic.id
        }

        request = self.factory.patch(path=PATHS["room"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 200)

    def test_update_room_if_not_authenticated(self):
        data = {
            "title": ROOMS["only english"]["title"],
            "topic": self.topic.id
        }

        request = self.factory.patch(path=PATHS["room"], data=data, format="json")
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 403)

    def test_update_room_if_not_exists(self):
        data = {
            "title": ROOMS["only english"]["title"]
        }

        request = self.factory.patch(path=PATHS["room"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomView().as_view()(request, title=self.room.title + "1")

        self.assertEqual(response.status_code, 404)

    def test_update_room_if_not_host(self):
        data = {
            "title": ROOMS["only english"]["title"]
        }

        request = self.factory.patch(path=PATHS["room"], data=data, format="json")
        force_authenticate(request=request, user=self.test_user)
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 403)

    def test_delete_room(self):
        request = self.factory.delete(path=PATHS["room"], format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 204)

    def test_delete_room_if_not_authenticated(self):
        request = self.factory.delete(path=PATHS["room"], format="json")
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 403)

    def test_delete_room_if_not_exists(self):
        request = self.factory.delete(path=PATHS["room"], format="json")
        force_authenticate(request=request, user=self.user)
        response = RoomView().as_view()(request, title=self.room.title + "1")

        self.assertEqual(response.status_code, 404)

    def test_delete_room_if_not_host(self):
        request = self.factory.delete(path=PATHS["room"], format="json")
        force_authenticate(request=request, user=self.test_user)
        response = RoomView().as_view()(request, title=self.room.title)

        self.assertEqual(response.status_code, 403)


class ConnectingViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        admin = User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        Room.objects.create(host=admin, topic=topic, number_of_participants=2, **ROOMS["just speak"])
        Room.objects.create(host=admin, topic=topic, key="secret", **ROOMS["only english"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.test_user = User.objects.get(pk=3)
        self.room_open = Room.objects.get(pk=1)
        self.room_close = Room.objects.get(pk=2)

    def test_connect_to_room(self):
        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ConnectingView().as_view()(request, room=self.room_open.title)

        self.assertEqual(response.status_code, 200)

    def test_connect_to_locked_room(self):
        data = {
            "key": "secret"
        }
        request = self.factory.patch(path=PATHS["connect"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = ConnectingView().as_view()(request, room=self.room_close.title)

        self.assertEqual(response.status_code, 200)

    def test_connect_to_room_if_room_is_full(self):
        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.admin)
        ConnectingView().as_view()(request, room=self.room_open.title)

        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        ConnectingView().as_view()(request, room=self.room_open.title)

        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.test_user)
        response = ConnectingView().as_view()(request, room=self.room_open.title)

        self.assertEqual(response.status_code, 403)

    def test_connect_to_room_if_user_is_already_in_room(self):
        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        ConnectingView().as_view()(request, room=self.room_open.title)

        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ConnectingView().as_view()(request, room=self.room_open.title)

        self.assertEqual(response.status_code, 403)

    def test_connect_to_room_if_user_is_already_in_another_room(self):
        data = {
            "key": "secret"
        }
        request = self.factory.patch(path=PATHS["connect"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        ConnectingView().as_view()(request, room=self.room_close.title)

        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        response = ConnectingView().as_view()(request, room=self.room_open.title)

        self.assertEqual(response.status_code, 403)


class DisconnectingViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        Room.objects.create(host=user, topic=topic, number_of_participants=2, **ROOMS["just speak"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.room = Room.objects.get(pk=1)

    def test_disconnect_from_room(self):
        request = self.factory.patch(path=PATHS["connect"], format="json")
        force_authenticate(request=request, user=self.user)
        ConnectingView().as_view()(request, room=self.room.title)

        request = self.factory.patch(path=PATHS["disconnect"], format="json")
        force_authenticate(request=request, user=self.user)
        response = DisconnectingView().as_view()(request, room=self.room.title)

        self.assertEqual(response.status_code, 200)

    def test_disconnect_from_room_if_user_is_not_in_room(self):
        request = self.factory.patch(path=PATHS["disconnect"], format="json")
        force_authenticate(request=request, user=self.user)
        response = DisconnectingView().as_view()(request, room=self.room.title)

        self.assertEqual(response.status_code, 403)
