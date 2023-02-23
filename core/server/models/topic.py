from django.db import models
from django.template.defaultfilters import truncatechars

from core.server.utils import ImageUtils

from .base import BaseModel


class Topic(BaseModel):

    title = models.CharField(max_length=64, unique=True)
    description = models.TextField(max_length=256)
    image = models.FileField(upload_to=ImageUtils.upload_image_to,
                             validators=[ImageUtils.validate_image_file_extension])

    @property
    def short_description(self):
        return truncatechars(self.description, 32)

    def delete(self):
        ImageUtils.remove_image_from(self)
        super(Topic, self).delete()

    def __str__(self):
        return self.title

    class Meta:
        db_table = "topic"
