from rest_framework.generics import ListCreateAPIView

from core.server.models import Topic
from core.server.permissions import IsAdminUserOrReadOnly
from core.server.serializers import TopicListSerializer


class TopicListView(ListCreateAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicListSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
