import json

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.server.models import Notification, Report, User
from core.server.serializers import ReportSerializer
from core.server.utils import WebSocketUtils


class ReportListView(ListCreateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):
        if self.request.method == "GET":
            return (IsAdminUser(),)
        return super(ReportListView, self).get_permissions()


class ReportView(RetrieveUpdateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAdminUser,)

    def update(self, request, *args, **kwargs):
        response = super(ReportView, self).update(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK and response.data["report"]["verdict"]:
            report = Report.objects.get(pk=kwargs["pk"])

            accused = User.objects.get(pk=report.accused.id)

            if report.verdict:
                if report.verdict == 1:
                    accused.is_active = False
                    accused.save()
                    WebSocketUtils.ban(user_id=accused.id)
                elif report.verdict == 2:
                    Notification.objects.create(
                        recipient=accused,
                        notification_type=Notification.NotificationType.WARNING,
                        content=json.dumps({"report": report.id})
                    )
                    WebSocketUtils.update_notification_list(user_id=accused.id)

                viewed = set()

                for rep in Report.objects.filter(accused=accused, verdict=Report.Verdict.NO_VERDICT, is_viewed=False):
                    rep.verdict = report.verdict
                    rep.reviewed_by = request.user
                    rep.is_viewed = True
                    rep.save()

                    if rep.sender.id in viewed:
                        continue

                    viewed.add(rep.sender.id)

                    Notification.objects.create(
                        recipient=rep.sender,
                        notification_type=Notification.NotificationType.REPORT,
                        content=json.dumps({"report": rep.id})
                    )
                    WebSocketUtils.update_notification_list(user_id=rep.sender.id)

        return response
