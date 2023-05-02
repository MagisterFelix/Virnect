from collections import OrderedDict

from rest_framework.exceptions import PermissionDenied
from rest_framework.serializers import ModelSerializer

from core.server.models import Tag


class TagSerializer(ModelSerializer):

    class Meta:
        model = Tag
        fields = "__all__"

    def validate(self, attrs):
        if Tag.objects.filter(room=attrs["room"]).count() == 5:
            raise PermissionDenied("Room cannot have more than 5 tags.")

        return super(TagSerializer, self).validate(attrs)

    def to_representation(self, instance):
        related = self.context.get("related")

        data = OrderedDict()

        data["tag"] = super(TagSerializer, self).to_representation(instance)

        if related or self.context["request"].method == "GET":
            return data["tag"]

        if self.context["request"].method == "POST":
            data["details"] = "Tag has been created."
        if self.context["request"].method in ("PATCH", "PUT"):
            data["details"] = "Tag has been updated."
        elif self.context["request"].method == "DELETE":
            data["details"] = "Tag has been deleted."

        return data
