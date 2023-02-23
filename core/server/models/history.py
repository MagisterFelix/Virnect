from django.db import models

from .base import BaseModel
from .user import User


class History(BaseModel):

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.CharField(max_length=64)
    tags = models.CharField(max_length=64)
    language = models.CharField(max_length=32)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.recorded_at.isoformat()

    class Meta:
        db_table = "history"
