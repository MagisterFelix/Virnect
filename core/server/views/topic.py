from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from core.server.models import Topic
from core.server.permissions import IsAdminUserOrReadOnly
from core.server.serializers import TopicListSerializer, TopicSerializer


class TopicListView(ListCreateAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicListSerializer
    permission_classes = (IsAdminUserOrReadOnly,)


class TopicView(RetrieveUpdateDestroyAPIView):

    lookup_field = "id"
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
