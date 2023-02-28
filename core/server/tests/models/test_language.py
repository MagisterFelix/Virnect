from django.db.models.fields.files import FieldFile
from django.db.utils import IntegrityError
from django.test import TestCase

from core.server.models.language import Language
from core.server.tests import LANGUAGE


class LanguageTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        Language.objects.create(**LANGUAGE["ukrainian"])

    def test_language_fields(self):
        language = Language.objects.get(id=1)

        self.assertIsInstance(language.name, str)
        self.assertEqual(language.name, LANGUAGE["ukrainian"]["name"])
        self.assertEqual(language._meta.get_field("name").max_length, 64)

        self.assertIsInstance(language.icon, FieldFile)

    def test_language_creation_with_non_unique_name(self):
        with self.assertRaises(IntegrityError):
            Language.objects.create(**LANGUAGE["ukrainian"])
