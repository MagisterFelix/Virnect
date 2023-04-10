from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from core.server.models import Topic
from core.server.permissions import IsAdminUserOrReadOnly
from core.server.serializers import TopicSerializer


class TopicListView(ListCreateAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = (IsAdminUserOrReadOnly,)


class TopicView(RetrieveUpdateDestroyAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
