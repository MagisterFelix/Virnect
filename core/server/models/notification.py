from django.db import models

from .base import BaseModel
from .user import User


class Notification(BaseModel):

    class NotificationType(models.IntegerChoices):
        MENTION = 0, "Mention"
        REPORT = 1, "Report"
        WARNING = 2, "Warning"
        MESSAGE_REPLY = 3, "Message reply"
        STATUS_CHANGE = 4, "Status change"

    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.IntegerField(choices=NotificationType.choices)
    content = models.TextField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    is_viewed = models.BooleanField(default=False)

    def __str__(self):
        return self.NotificationType.choices[self.notification_type][1]

    class Meta:
        db_table = "notification"
