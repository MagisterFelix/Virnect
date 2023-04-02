from rest_framework.serializers import ModelSerializer

from core.server.models import Topic


class TopicListSerializer(ModelSerializer):

    class Meta:
        model = Topic
        fields = "__all__"
