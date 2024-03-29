from django.db import models

from .base import BaseModel
from .user import User


class Report(BaseModel):

    class Reason(models.IntegerChoices):
        TEXT_ABUSE = 0, "Text abuse"
        VOICE_ABUSE = 1, "Voice abuse"
        OFFENSIVE_NAME = 2, "Offensive name"
        INAPPROPRIATE_AVATAR = 3, "Inappropriate avatar"
        INAPPROPRIATE_ROOM_NAME = 4, "Inappropriate room name"
        INAPPROPRIATE_ROOM_TAGS = 5, "Inappropriate room tags"
        DISRESPECTFUL_BEHAVIOR = 6, "Disrespectful behavior"
        THREATS = 7, "Threats"

    class Verdict(models.IntegerChoices):
        NO_VERDICT = 0, "No verdict"
        BLOCKING = 1, "Blocking"
        WARNING = 2, "Warning"

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    accused = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accused")
    reason = models.IntegerField(choices=Reason.choices)
    verdict = models.IntegerField(choices=Verdict.choices, default=Verdict.NO_VERDICT)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="reviewed_by", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_viewed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk and self.verdict:
            self.is_viewed = True

        super(Report, self).save(*args, **kwargs)

    def __str__(self):
        return self.Reason.choices[self.reason][1]

    class Meta:
        db_table = "report"
        ordering = ["is_viewed", "-created_at"]
