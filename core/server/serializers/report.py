from collections import OrderedDict

from rest_framework.serializers import ModelSerializer

from core.server.models import Report
from core.server.serializers.user import UserSerializer


class ReportSerializer(ModelSerializer):

    class Meta:
        model = Report
        exclude = ["sender", "reviewed_by"]

    def validate(self, attrs):
        if self.context["request"].method == "POST":
            attrs["sender"] = self.context["request"].user
        elif self.context["request"].method == "PATCH":
            attrs["reviewed_by"] = self.context["request"].user

        return super(ReportSerializer, self).validate(attrs)

    def to_representation(self, instance):
        data = OrderedDict()

        data["report"] = super(ReportSerializer, self).to_representation(instance)

        data["report"]["sender"] = UserSerializer(instance=instance.sender, context=self.context).data
        data["report"]["suspect"] = UserSerializer(instance=instance.suspect, context=self.context).data

        if instance.reviewed_by is not None:
            data["report"]["reviewed_by"] = UserSerializer(instance=instance.reviewed_by, context=self.context).data
        else:
            data["report"]["reviewed_by"] = None

        if self.context["request"].method == "GET":
            return data["report"]

        if self.context["request"].method == "POST":
            data["details"] = "Report has been created."
        elif self.context["request"].method == "PATCH":
            data["details"] = "Report has been updated."

        return data
