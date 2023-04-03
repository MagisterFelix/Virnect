from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Tag


class TagListSerializer(ModelSerializer):

    class Meta:
        model = Tag
        fields = "__all__"

    def to_representation(self, instance):
        if self.context["request"].method == "GET":
            return super(TagListSerializer, self).to_representation(instance)

        data = OrderedDict()

        data["details"] = "Tag has been created."

        return data
