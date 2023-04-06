from collections import OrderedDict

from rest_framework.exceptions import PermissionDenied
from rest_framework.serializers import ModelSerializer

from core.server.models import Tag


class TagListSerializer(ModelSerializer):

    class Meta:
        model = Tag
        fields = "__all__"

    def validate(self, attrs):
        room = attrs["room"]

        if Tag.objects.filter(room=room).count() + self.context["count"] > 5:
            raise PermissionDenied("Room cannot has more than 5 tags.")

        return super(TagListSerializer, self).validate(attrs)

    def to_representation(self, instance):
        if self.context["request"].method == "GET":
            return super(TagListSerializer, self).to_representation(instance)

        data = OrderedDict()

        data["details"] = "Tag has been created."

        return data
