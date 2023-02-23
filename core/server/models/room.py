from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .base import BaseModel
from .topic import Topic
from .user import User


class Room(BaseModel):

    class Language(models.IntegerChoices):
        INTERNATIONAL = 0, "International"
        ENGLISH = 1, "English"
        UKRAINIAN = 2, "Ukrainian"

    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="host")
    title = models.CharField(max_length=64, unique=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    language = models.IntegerField(choices=Language.choices, default=Language.INTERNATIONAL)
    number_of_participants = models.PositiveSmallIntegerField(default=10,
                                                              validators=[MinValueValidator(2),
                                                                          MaxValueValidator(10)])
    participants = models.ManyToManyField(User, related_name="participants", blank=True)
    key = models.CharField(max_length=16, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super(Room, self).clean()

        if self.host_id and Room.objects.filter(host=self.host).count() == 5:
            raise ValidationError("User cannot host more than 5 rooms.", code="invalid")

    def __str__(self):
        return self.title

    class Meta:
        db_table = "room"
