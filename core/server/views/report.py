import json

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.server.models import Notification, Report, User
from core.server.serializers import ReportSerializer
from core.server.utils import WebSocketsUtils


class ReportListView(ListCreateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAuthenticated,)


class ReportView(RetrieveUpdateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAdminUser,)

    def update(self, request, *args, **kwargs):
        response = super(ReportView, self).update(request, *args, **kwargs)

        if response.status_code == 200 and response.data["report"]["verdict"]:
            sender = User.objects.get(id=response.data["report"]["sender"]["id"])
            accused = User.objects.get(id=response.data["report"]["accused"]["id"])

            if response.data["report"]["verdict"] == 1:
                accused.is_active = False
                accused.save()
            elif response.data["report"]["verdict"] == 2:
                Notification.objects.create(
                    recipient=accused,
                    notification_type=Notification.NotificationType.WARNING,
                    content=json.dumps({"report": response.data["report"]["id"]})
                )
                WebSocketsUtils.update_notification_list(accused.username)

            Notification.objects.create(
                recipient=sender,
                notification_type=Notification.NotificationType.REPORT,
                content=json.dumps({"report": response.data["report"]["id"]})
            )
            WebSocketsUtils.update_notification_list(sender.username)

        return response
