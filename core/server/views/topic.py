from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from core.server.models import Room, Topic
from core.server.permissions import IsAdminUserOrReadOnly
from core.server.serializers import TopicSerializer
from core.server.utils import WebSocketUtils


class TopicListView(ListCreateAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = (IsAdminUserOrReadOnly,)


class TopicView(RetrieveUpdateDestroyAPIView):

    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = (IsAdminUserOrReadOnly,)

    def destroy(self, request, *args, **kwargs):
        topic = self.get_object()
        related_rooms = [room.id for room in Room.objects.filter(topic=topic)]

        response = super(TopicView, self).destroy(request, *args, **kwargs)

        if response.status_code == 204:
            for room_id in related_rooms:
                WebSocketUtils.delete_room(room_id=room_id)

            WebSocketUtils.update_room_list()

        return response
