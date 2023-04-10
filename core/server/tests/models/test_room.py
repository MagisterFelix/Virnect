from datetime import datetime

from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.test import TestCase

from core.server.models import Room, Topic, User
from core.server.tests import ROOMS, TOPICS, USERS


class RoomTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        host = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])

        room = Room.objects.create(host=host, topic=topic, **ROOMS["just speak"])
        room.participants.add(host)

    def test_room_fields(self):
        room = Room.objects.get(pk=1)

        self.assertIsInstance(room.host, User)
        self.assertEqual(room.host.username, USERS["user"]["username"])

        self.assertIsInstance(room.title, str)
        self.assertEqual(room.title, ROOMS["just speak"]["title"])
        self.assertEqual(room._meta.get_field("title").max_length, 64)

        self.assertIsInstance(room.language, str)
        self.assertEqual(room.language, Room.Language.IN)

        self.assertIsInstance(room.number_of_participants, int)
        self.assertEqual(room.number_of_participants, 10)

        self.assertEqual(room.participants.count(), 1)
        self.assertIsInstance(room.participants.through.objects.get(pk=1).user, User)

        self.assertIsInstance(room.key, str)
        self.assertEqual(room._meta.get_field("key").max_length, 16)

        self.assertIsInstance(room.created_at, datetime)

    def test_room_creation_with_non_unique_title(self):
        with self.assertRaises(IntegrityError):
            Room.objects.create(**ROOMS["just speak"])

    def test_room_creation_without_host(self):
        topic = Topic.objects.get(pk=1)

        with self.assertRaises(IntegrityError):
            Room.objects.create(topic=topic, **ROOMS["only english"])

    def test_room_creation_without_topic(self):
        host = User.objects.get(pk=1)

        with self.assertRaises(IntegrityError):
            Room.objects.create(host=host, **ROOMS["only english"])

    def test_room_creation_with_zero_number_of_participants(self):
        host = User.objects.get(pk=1)
        topic = Topic.objects.get(pk=1)

        with self.assertRaises(ValidationError):
            Room(host=host,
                 topic=topic,
                 title=ROOMS["only english"]["title"],
                 number_of_participants=0).full_clean()

    def test_room_creation_by_one_user_six_times(self):
        host = User.objects.create_user(**USERS["test"])
        topic = Topic.objects.get(pk=1)

        for i in range(5):
            Room.objects.create(host=host, topic=topic, title=f"title_{i}")

        with self.assertRaises(ValidationError):
            Room(host=host, topic=topic, title="title_5").full_clean()

    def test_room_adding_participant(self):
        room = Room.objects.get(pk=1)
        participant = User.objects.create(**USERS["test"])

        count_before = room.participants.count()
        room.participants.add(participant)
        count_after = room.participants.count()

        self.assertEqual(count_after, count_before + 1)

    def test_room_adding_non_unique_participant(self):
        room = Room.objects.get(pk=1)
        participant = User.objects.get(pk=1)

        count_before = room.participants.count()
        room.participants.add(participant)
        count_after = room.participants.count()

        self.assertEqual(count_after, count_before)

    def test_room_removing_participant(self):
        room = Room.objects.get(pk=1)
        participant = User.objects.get(pk=1)

        count_before = room.participants.count()
        room.participants.remove(participant)
        count_after = room.participants.count()

        self.assertEqual(count_after, count_before - 1)

    def test_room_removing_on_deleting_host(self):
        before_deleting = Room.objects.count()
        User.objects.get(pk=1).delete()
        after_deleting = Room.objects.count()

        self.assertGreater(before_deleting, after_deleting)

    def test_room_removing_on_deleting_topic(self):
        before_deleting = Room.objects.count()
        Topic.objects.get(pk=1).delete()
        after_deleting = Room.objects.count()

        self.assertGreater(before_deleting, after_deleting)
