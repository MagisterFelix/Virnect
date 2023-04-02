from rest_framework.generics import ListCreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from core.server.filters import RoomFilter
from core.server.models import Room
from core.server.serializers import RoomListSerializer


class RoomListView(ListCreateAPIView):

    queryset = Room.objects.all()
    serializer_class = RoomListSerializer
    permission_classes = (IsAuthenticated,)
    filterset_class = RoomFilter
    pagination_class = PageNumberPagination
    pagination_class.page_size = 5
