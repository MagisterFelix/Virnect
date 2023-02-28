from django.db import models

from core.server.utils import ImageUtils

from .base import BaseModel


class Language(BaseModel):

    name = models.CharField(max_length=64, unique=True)
    icon = models.FileField(upload_to=ImageUtils.upload_image_to,
                            validators=[ImageUtils.validate_image_file_extension])

    @classmethod
    def get_default(cls):
        language, _ = cls.objects.get_or_create(
            name="International",
            defaults=dict(icon="../static/languages/international.svg")
        )
        return language.pk

    def clean(self):
        self.name = self.name.capitalize()
        super(Language, self).clean()

    def delete(self, *args, **kwargs):
        ImageUtils.remove_image_from(self)
        super(Language, self).delete(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "language"
