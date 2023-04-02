from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Room, Topic, User
from core.server.tests import PATHS, ROOMS, TOPICS, USERS
from core.server.views import RoomListView


class RoomListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=1)
        self.topic = Topic.objects.get(id=1)
        self.room = Room.objects.get(id=1)

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
