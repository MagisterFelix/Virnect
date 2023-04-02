from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Topic
from core.server.serializers import TopicListSerializer


class TopicListView(ListAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicListSerializer
    permission_classes = (IsAuthenticated,)
