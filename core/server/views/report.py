from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.serializers import ReportSerializer


class ReportView(CreateAPIView):

    serializer_class = ReportSerializer
    permission_classes = (IsAuthenticated,)
