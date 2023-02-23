from django.core.exceptions import ValidationError
from django.db import models

from .base import BaseModel
from .room import Room


class Tag(BaseModel):

    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    name = models.CharField(max_length=16)

    def clean(self):
        super(Tag, self).clean()

        if self.room_id and Tag.objects.filter(room=self.room).count() == 5:
            raise ValidationError("Room cannot have more than 5 tags.", code="invalid")

    def __str__(self):
        return self.name

    class Meta:
        db_table = "tag"
        unique_together = (("room", "name",))
