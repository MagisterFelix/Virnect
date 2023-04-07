from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Report


class ReportSerializer(ModelSerializer):

    class Meta:
        model = Report
        exclude = ["sender"]

    def validate(self, attrs):
        attrs["sender"] = self.context["request"].user
        return super(ReportSerializer, self).validate(attrs)

    def to_representation(self, instance):
        data = OrderedDict()

        data["report"] = super(ReportSerializer, self).to_representation(instance)

        if self.context["request"].method == "GET":
            return data["report"]

        if self.context["request"].method == "POST":
            data["details"] = "Report has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Report has been updated."

        return data
