from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from core.server.models import Topic, User
from core.server.tests import PATHS, TOPICS, USERS
from core.server.utils import ImageUtils
from core.server.views import TopicListView, TopicView


class TopicListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        Topic.objects.create(**TOPICS["chatting"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.topic = Topic.objects.get(pk=1)

    def test_get_topics(self):
        request = self.factory.get(path=PATHS["topics"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_get_topics_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["topics"], format="json")
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_create_topic(self):
        data = {
            "title": TOPICS["games"]["title"],
            "description": TOPICS["games"]["description"],
            "image": SimpleUploadedFile(TOPICS["games"]["image"], b"content")
        }

        request = self.factory.post(path=PATHS["topics"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = TopicListView().as_view()(request)

        ImageUtils.remove_image_from(Topic.objects.get(pk=2))

        self.assertEqual(response.status_code, 201)

    def test_create_topic_if_not_authenticated(self):
        data = {
            "title": TOPICS["games"]["title"],
            "description": TOPICS["games"]["description"],
            "image": SimpleUploadedFile(TOPICS["games"]["image"], b"content")
        }

        request = self.factory.post(path=PATHS["topics"], data=data, format="multipart")
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_create_topic_if_not_staff(self):
        data = {
            "title": TOPICS["games"]["title"],
            "description": TOPICS["games"]["description"],
            "image": SimpleUploadedFile(TOPICS["games"]["image"], b"content")
        }

        request = self.factory.post(path=PATHS["topics"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 403)


class TopicViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_superuser(**USERS["admin"])
        User.objects.create_user(**USERS["user"])
        Topic.objects.create(**TOPICS["chatting"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.get(pk=1)
        self.user = User.objects.get(pk=2)
        self.topic = Topic.objects.get(pk=1)

    def test_get_topic(self):
        request = self.factory.get(path=PATHS["topic"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 200)

    def test_get_topic_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["topic"], format="json")
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 403)

    def test_update_topic(self):
        data = {
            "title": TOPICS["games"]["title"]
        }

        request = self.factory.patch(path=PATHS["topic"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 200)

    def test_update_topic_if_not_authenticated(self):
        data = {
            "title": TOPICS["games"]["title"]
        }

        request = self.factory.patch(path=PATHS["topic"], data=data, format="multipart")
        response = TopicView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_update_topic_if_not_exists(self):
        data = {
            "title": TOPICS["games"]["title"]
        }

        request = self.factory.patch(path=PATHS["topic"], data=data, format="multipart")
        force_authenticate(request=request, user=self.admin)
        response = TopicView().as_view()(request, pk=self.topic.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_update_topic_if_not_staff(self):
        data = {
            "title": TOPICS["games"]["title"]
        }

        request = self.factory.post(path=PATHS["topic"], data=data, format="multipart")
        force_authenticate(request=request, user=self.user)
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 403)

    def test_delete_topic(self):
        request = self.factory.delete(path=PATHS["topic"], format="json")
        force_authenticate(request=request, user=self.admin)
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 204)

    def test_delete_topic_if_not_authenticated(self):
        request = self.factory.delete(path=PATHS["topic"], format="json")
        response = TopicView().as_view()(request)

        self.assertEqual(response.status_code, 403)

    def test_delete_topic_if_not_exists(self):
        request = self.factory.delete(path=PATHS["topic"], format="json")
        force_authenticate(request=request, user=self.admin)
        response = TopicView().as_view()(request, pk=self.topic.id + 1)

        self.assertEqual(response.status_code, 404)

    def test_delete_topic_if_not_staff(self):
        request = self.factory.delete(path=PATHS["topic"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TopicView().as_view()(request, pk=self.topic.id)

        self.assertEqual(response.status_code, 403)
