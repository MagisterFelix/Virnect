from django.core.exceptions import ValidationError
from django.test import TestCase

from core.server.models import Room, Tag, Topic, User
from core.server.tests import ROOMS, TAGS, TOPICS, USERS


class TagTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        host = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=host, topic=topic, **ROOMS["only english"])

        Tag.objects.create(room=room, **TAGS["english"])

    def test_tag_fields(self):
        tag = Tag.objects.get(pk=1)

        self.assertIsInstance(tag.room, Room)
        self.assertEqual(tag.room.title, ROOMS["only english"]["title"])

        self.assertIsInstance(tag.name, str)
        self.assertEqual(tag.name, TAGS["english"]["name"])
        self.assertEqual(tag._meta.get_field("name").max_length, 16)

    def test_tag_creation_with_non_unique_name_in_the_same_room(self):
        room = Room.objects.get(pk=1)

        with self.assertRaises(ValidationError):
            Tag(room=room, **TAGS["english"]).full_clean()

    def test_tag_creation_with_non_unique_name_in_new_room(self):
        host = User.objects.get(pk=1)
        topic = Topic.objects.get(pk=1)
        room = Room.objects.create(host=host, topic=topic, **ROOMS["just speak"])

        Tag(room=room, **TAGS["english"]).full_clean()

    def test_tag_creation_in_the_same_room_six_times(self):
        host = User.objects.get(pk=1)
        topic = Topic.objects.get(pk=1)
        room = Room.objects.create(host=host, topic=topic, **ROOMS["just speak"])

        for i in range(5):
            Tag.objects.create(room=room, name=f"name_{i}")

        with self.assertRaises(ValidationError):
            Tag(room=room, name="name_5").full_clean()

    def test_tag_removing_on_deleting_room(self):
        before_deleting = Tag.objects.count()
        Room.objects.get(pk=1).delete()
        after_deleting = Tag.objects.count()

        self.assertGreater(before_deleting, after_deleting)
