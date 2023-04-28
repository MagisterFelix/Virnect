import json
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Message, Notification, Report, Room, User
from core.server.serializers import NotificationSerializer


class NotificationListView(ListAPIView):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        old_notifications = Notification.objects.filter(Q(created_at__lt=timezone.now() - timedelta(days=7)))
        if old_notifications.exists():
            old_notifications.delete()

        for notification in Notification.objects.filter(recipient=self.request.user):
            content = json.loads(notification.content)

            if notification.notification_type == Notification.NotificationType.MENTION:
                room = Room.objects.get_or_none(pk=content["room"])
                user = User.objects.get_or_none(pk=content["user"])

                if room is None or user is None:
                    notification.delete()
            elif notification.notification_type in (Notification.NotificationType.REPORT,
                                                    Notification.NotificationType.WARNING):
                report = Report.objects.get_or_none(pk=content["report"])

                if report is None:
                    notification.delete()
            elif notification.notification_type == Notification.NotificationType.MESSAGE_REPLY:
                room = Room.objects.get_or_none(pk=content["room"])
                user = User.objects.get_or_none(pk=content["user"])
                message = Message.objects.get_or_none(pk=content["message"])

                if room is None or user is None or message is None or message.reply_to is None:
                    notification.delete()

        queryset = super(NotificationListView, self).get_queryset()

        return queryset.filter(recipient=self.request.user)


class NotificationView(RetrieveUpdateAPIView):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(NotificationView, self).get_queryset()
        return queryset.filter(recipient=self.request.user)
