from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Message
from core.server.permissions import IsOwnerOrReadOnly
from core.server.serializers import MessageSerializer


class MessageListView(ListCreateAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(MessageListView, self).get_queryset()
        return queryset.filter(room__title=self.kwargs["room"])


class MessageView(RetrieveUpdateDestroyAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def get_queryset(self):
        queryset = super(MessageView, self).get_queryset()
        return queryset.filter(room__title=self.kwargs["room"])
