from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Room, Tag, Topic, User
from core.server.tests import PATHS, ROOMS, TAGS, TOPICS, USERS
from core.server.views import TagListView, TagView


class TagListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])
        Tag.objects.create(room=room, **TAGS["english"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.test_user = User.objects.get(pk=2)
        self.room = Room.objects.get(pk=1)
        self.tag = Tag.objects.get(pk=1)

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

        request = self.factory.post(path=PATHS["tags"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 201)

    def test_create_tag_if_not_authenticated(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["tags"], data=data, format="json")
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_create_tag_if_not_host(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["tags"], data=data, format="json")
        force_authenticate(request=request, user=self.test_user)
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_create_tag_if_room_already_has_five_tags(self):
        for i in range(4):
            data = {
                "name": f"tag#{i}",
                "room": self.room.id
            }

            request = self.factory.post(path=PATHS["tags"], data=data, format="json")
            force_authenticate(request=request, user=self.user)
            response = TagListView().as_view()(request)

        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["tags"], data=data, format="json")
        force_authenticate(request=request, user=self.user)
        response = TagListView().as_view()(request)

        self.assertEqual(response.status_code, 403)


class TagViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(**USERS["user"])
        User.objects.create_user(**USERS["test"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=user, topic=topic, **ROOMS["just speak"])
        Tag.objects.create(room=room, **TAGS["english"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(pk=1)
        self.test_user = User.objects.get(pk=2)
        self.room = Room.objects.get(pk=1)
        self.tag = Tag.objects.get(pk=1)

    def test_get_tag(self):
        request = self.factory.get(path=PATHS["tag"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TagView().as_view()(request, pk=self.tag.id)

        self.assertEqual(response.status_code, 200)

    def test_update_tag(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.patch(path=PATHS["tag"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = TagView().as_view()(request, pk=self.tag.id)

        self.assertEqual(response.status_code, 200)

    def test_update_tag_if_not_authenticated(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.patch(path=PATHS["tag"], data=data, format="multipart")
        response = TagView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_tag_if_not_exists(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.patch(path=PATHS["tag"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = TagView().as_view()(request, pk=self.tag.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_update_tag_if_not_host(self):
        data = {
            "name": TAGS["gaming"]["name"],
            "room": self.room.id
        }

        request = self.factory.post(path=PATHS["tag"], data=data, format="multipart")
        force_authenticate(request=request, user=self.test_user)
        response = TagView().as_view()(request, pk=self.tag.id)

        self.assertEqual(response.status_code, 403)

    def test_delete_tag(self):
        request = self.factory.delete(path=PATHS["tag"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TagView().as_view()(request, pk=self.tag.id)

        self.assertEqual(response.status_code, 204)

    def test_delete_tag_if_not_authenticated(self):
        request = self.factory.delete(path=PATHS["tag"], format="json")
        response = TagView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_delete_topic_if_not_exists(self):
        request = self.factory.delete(path=PATHS["tag"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TagView().as_view()(request, pk=self.tag.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_delete_tag_if_not_host(self):
        request = self.factory.delete(path=PATHS["tag"], format="json")
        force_authenticate(request=request, user=self.test_user)
        response = TagView().as_view()(request, pk=self.tag.id)

        self.assertEqual(response.status_code, 403)
