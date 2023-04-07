from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Report
from core.server.serializers import ReportSerializer


class ReportListView(ListCreateAPIView):

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (IsAuthenticated,)
