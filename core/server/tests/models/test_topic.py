from django.db.models.fields.files import FieldFile
from django.db.utils import IntegrityError
from django.test import TestCase

from core.server.models.topic import Topic
from core.server.tests import TOPICS


class TopicTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        Topic.objects.create(**TOPICS["chatting"])

    def test_topic_fields(self):
        topic = Topic.objects.get(id=1)

        self.assertIsInstance(topic.title, str)
        self.assertEqual(topic.title, TOPICS["chatting"]["title"])
        self.assertEqual(topic._meta.get_field("title").max_length, 64)

        self.assertIsInstance(topic.description, str)
        self.assertEqual(topic.description, TOPICS["chatting"]["description"])
        self.assertEqual(topic._meta.get_field("description").max_length, 256)
        self.assertLessEqual(len(topic.short_description), 32)

        self.assertIsInstance(topic.image, FieldFile)

    def test_topic_creation_with_non_unique_title(self):
        with self.assertRaises(IntegrityError):
            Topic.objects.create(**TOPICS["chatting"])
