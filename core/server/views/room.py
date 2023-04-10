from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from core.server.filters import RoomFilter
from core.server.models import Room
from core.server.permissions import IsOwnerOrReadOnly, IsParticipant
from core.server.serializers import ConnectingSerializer, DisconnectingSerializer, RoomSerializer
from core.server.utils import WebSocketsUtils


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

    def update(self, request, *args, **kwargs):
        response = super(RoomView, self).update(request, *args, **kwargs)

        if response.status_code == 200:
            WebSocketsUtils.update_room(kwargs["title"])
            WebSocketsUtils.update_room_list()

        return response

    def destroy(self, request, *args, **kwargs):
        response = super(RoomView, self).destroy(request, *args, **kwargs)

        if response.status_code == 204:
            WebSocketsUtils.delete_room(kwargs["title"])
            WebSocketsUtils.update_room_list()

        return response


class ConnectingView(UpdateAPIView):

    lookup_field = "title"
    lookup_url_kwarg = "room"
    queryset = Room.objects.all()
    serializer_class = ConnectingSerializer
    permission_classes = (IsAuthenticated,)

    def update(self, request, *args, **kwargs):
        response = super(ConnectingView, self).update(request, *args, **kwargs)

        if response.status_code == 200:
            WebSocketsUtils.update_room(kwargs["room"])
            WebSocketsUtils.update_room_list()

        return response


class DisconnectingView(UpdateAPIView):

    lookup_field = "title"
    lookup_url_kwarg = "room"
    queryset = Room.objects.all()
    serializer_class = DisconnectingSerializer
    permission_classes = (IsAuthenticated,)

    def update(self, request, *args, **kwargs):
        response = super(DisconnectingView, self).update(request, *args, **kwargs)

        if response.status_code == 200:
            WebSocketsUtils.update_room(kwargs["room"])
            WebSocketsUtils.update_room_list()

        return response
