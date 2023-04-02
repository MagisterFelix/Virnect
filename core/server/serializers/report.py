from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Report


class ReportSerializer(ModelSerializer):

    class Meta:
        model = Report
        fields = "__all__"

    def to_representation(self, instance):
        data = OrderedDict()

        data["details"] = "Report has been sent."

        return data
