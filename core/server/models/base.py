from django.db import models


class BaseManager(models.Manager):

    def get_or_none(self, **kwargs):
        try:
            return self.get(**kwargs)
        except self.model.DoesNotExist:
            return None


class BaseModel(models.Model):

    objects = BaseManager()

    class Meta:
        abstract = True
