from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from core.server.filters import RoomFilter
from core.server.models import Room
from core.server.permissions import IsOwnerOrReadOnly
from core.server.serializers import RoomSerializer
from core.server.utils import WebSocketUtils


class RoomListView(ListCreateAPIView):

    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsAuthenticated,)
    filterset_class = RoomFilter
    pagination_class = PageNumberPagination
    pagination_class.page_size = 5

    @property
    def paginator(self):
        no_pagination = self.request.query_params.get("no_pagination")

        if no_pagination is not None:
            return None

        return super(RoomListView, self).paginator


class RoomView(RetrieveUpdateDestroyAPIView):

    lookup_field = "title"
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def update(self, request, *args, **kwargs):
        room = self.get_object()

        response = super(RoomView, self).update(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            WebSocketUtils.update_room(room_id=room.id, room_title=response.data["room"]["title"])
            WebSocketUtils.update_room_list()

        return response

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()

        response = super(RoomView, self).destroy(request, *args, **kwargs)

        if response.status_code == status.HTTP_204_NO_CONTENT:
            WebSocketUtils.delete_room(room_id=room.id)
            WebSocketUtils.update_room_list()

        return response
