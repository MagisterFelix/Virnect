from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from core.server.models.topic import Topic
from core.server.models.user import User
from core.server.tests import PATHS, TOPICS, USERS
from core.server.views.topic import TopicListView


class TopicListViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(**USERS["user"])
        Topic.objects.create(**TOPICS["chatting"])

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(id=1)
        self.topic = Topic.objects.get(id=1)

    def test_get_topics(self):
        request = self.factory.get(path=PATHS["topics"], format="json")
        force_authenticate(request=request, user=self.user)
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 200)

    def test_get_topics_if_not_authenticated(self):
        request = self.factory.get(path=PATHS["topics"], format="json")
        response = TopicListView().as_view()(request)

        self.assertEqual(response.status_code, 403)
