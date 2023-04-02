from django.db import models
from django.template.defaultfilters import truncatechars
from django.utils import timezone

from .base import BaseModel
from .room import Room
from .user import User


class Message(BaseModel):

    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(max_length=512)
    reply_to = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    @property
    def short_message(self):
        return truncatechars(self.text, 32)

    def save(self, *args, **kwargs):
        if self.pk:
            self.updated_at = timezone.now()

        super(Message, self).save(*args, **kwargs)

    def __str__(self):
        return self.short_message

    class Meta:
        db_table = "message"
        ordering = ["created_at"]
