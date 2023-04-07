from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Topic


class TopicSerializer(ModelSerializer):

    class Meta:
        model = Topic
        fields = "__all__"

    def to_representation(self, instance):
        data = OrderedDict()

        data["topic"] = super(TopicSerializer, self).to_representation(instance)

        if self.context["request"].method == "GET" or self.context.get("related"):
            return data["topic"]

        if self.context["request"].method == "POST":
            data["details"] = "Topic has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Topic has been updated."
        elif self.context["request"].method == "DELETE":
            data["details"] = "Topic has been deleted."

        return data
