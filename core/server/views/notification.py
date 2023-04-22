from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Notification
from core.server.serializers import NotificationSerializer


class NotificationListView(ListAPIView):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(NotificationListView, self).get_queryset()
        return queryset.filter(recipient=self.request.user)


class NotificationView(RetrieveUpdateAPIView):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(NotificationView, self).get_queryset()
        return queryset.filter(recipient=self.request.user)
