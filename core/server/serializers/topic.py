from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Topic


class TopicListSerializer(ModelSerializer):

    class Meta:
        model = Topic
        fields = "__all__"

    def to_representation(self, instance):
        if self.context["request"].method == "GET":
            return super(TopicListSerializer, self).to_representation(instance)

        data = OrderedDict()

        data["details"] = "Topic has been created."

        return data
