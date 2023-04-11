from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.server.models import Report
from core.server.serializers import ReportSerializer


class ReportListView(ListCreateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAuthenticated,)


class ReportView(RetrieveUpdateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAdminUser,)
