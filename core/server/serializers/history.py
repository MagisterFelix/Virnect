from rest_framework.serializers import ModelSerializer

from core.server.models import History


class HistorySerializer(ModelSerializer):

    class Meta:
        model = History
        fields = "__all__"
