from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from core.server.filters import RoomFilter
from core.server.models import Room
from core.server.permissions import IsOwnerOrReadOnly, IsParticipant
from core.server.serializers import ConnectingSerializer, DisconnectingSerializer, RoomSerializer


class RoomListView(ListCreateAPIView):

    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsAuthenticated,)
    filterset_class = RoomFilter
    pagination_class = PageNumberPagination
    pagination_class.page_size = 5


class RoomView(RetrieveUpdateDestroyAPIView):

    lookup_field = "title"
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def get_permissions(self):
        if self.request.method == "GET":
            return (IsParticipant(),)
        return super(RoomView, self).get_permissions()


class ConnectingView(UpdateAPIView):

    lookup_field = "title"
    lookup_url_kwarg = "room"
    queryset = Room.objects.all()
    serializer_class = ConnectingSerializer
    permission_classes = (IsAuthenticated,)


class DisconnectingView(UpdateAPIView):

    lookup_field = "title"
    lookup_url_kwarg = "room"
    queryset = Room.objects.all()
    serializer_class = DisconnectingSerializer
    permission_classes = (IsAuthenticated,)
