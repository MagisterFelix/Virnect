from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Room, Tag, Topic, User
from core.server.tests import PATHS, ROOMS, TAGS, TOPICS, USERS
from core.server.views import TagListView


class TagListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])
        Tag.objects.create(room=room, **TAGS["english"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=1)
        self.room = Room.objects.get(id=1)
        self.tag = Tag.objects.get(id=1)

    def test_get_tags(self):
        request = self.factory.get(path=PATHS["tags"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_create_tag(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["topics"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_create_tag_if_not_authenticated(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["topics"], data=data, format="multipart")
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 403)
