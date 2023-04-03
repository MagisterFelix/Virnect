from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Tag
from core.server.serializers import TagListSerializer


class TagListView(ListCreateAPIView):

    queryset = Tag.objects.all()
    serializer_class = TagListSerializer
    permission_classes = (IsAuthenticated,)
