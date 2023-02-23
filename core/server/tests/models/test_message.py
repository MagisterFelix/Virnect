from datetime import datetime

from django.test import TestCase

from core.server.models.message import Message
from core.server.models.room import Room
from core.server.models.topic import Topic
from core.server.models.user import User
from core.server.tests import MESSAGES, ROOMS, TOPICS, USERS


class MessageTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        host = User.objects.create_user(**USERS["user"])
        topic = Topic.objects.create(**TOPICS["chatting"])
        room = Room.objects.create(host=host, topic=topic, **ROOMS["only english"])

        Message.objects.create(room=room, author=host, **MESSAGES["greetings"])

    def test_message_fields(self):
        message = Message.objects.get(id=1)

        self.assertIsInstance(message.room, Room)
        self.assertEqual(message.room.title, ROOMS["only english"]["title"])

        self.assertIsInstance(message.author, User)
        self.assertEqual(message.author.username, USERS["user"]["username"])

        self.assertIsInstance(message.text, str)
        self.assertEqual(message.text, MESSAGES["greetings"]["text"])
        self.assertEqual(message._meta.get_field("text").max_length, 512)
        self.assertLessEqual(len(message.short_message), 32)

        self.assertIsNone(message.reply_to)

        self.assertIsInstance(message.created_at, datetime)
        self.assertIsNone(message.updated_at)

    def test_message_answering(self):
        room = Room.objects.get(id=1)
        message = Message.objects.get(id=1)
        author = User.objects.get(id=1)

        reply = Message.objects.create(room=room, author=author, reply_to=message, **MESSAGES["reply"])

        self.assertIsNotNone(reply.reply_to)
        self.assertIsInstance(reply.reply_to, Message)

    def test_message_updating(self):
        message = Message.objects.get(id=1)

        self.assertIsNone(message.updated_at)

        message.text = "Greetings"
        message.save()
        message = Message.objects.get(id=1)

        self.assertEqual(message.text, "Greetings")
        self.assertIsNotNone(message.updated_at)
        self.assertIsInstance(message.updated_at, datetime)

    def test_message_removing_on_deleting_room(self):
        before_deleting = Message.objects.count()
        Room.objects.get(id=1).delete()
        after_deleting = Message.objects.count()

        self.assertGreater(before_deleting, after_deleting)

    def test_message_removing_on_deleting_author(self):
        before_deleting = Message.objects.count()
        User.objects.get(id=1).delete()
        after_deleting = Message.objects.count()

        self.assertGreater(before_deleting, after_deleting)
