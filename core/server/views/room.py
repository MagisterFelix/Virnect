from django.db.models import Case, IntegerField, Value, When
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from core.server.filters import RoomFilter
from core.server.models import History, Room
from core.server.permissions import IsOwnerOrReadOnly
from core.server.serializers import HistorySerializer, RoomSerializer
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

    def get_queryset(self):
        rooms = super(RoomListView, self).get_queryset()
        history = History.objects.filter(owner=self.request.user)

        if rooms.count() > 4 and history.count() > 4:
            from core.server.recommendation_system import recommendation_system

            serialized_rooms = RoomSerializer(
                instance=rooms,
                context={"request": self.request},
                many=True
            ).data

            if recommendation_system.rooms != serialized_rooms:
                recommendation_system.train(rooms=serialized_rooms)

            serialized_history = HistorySerializer(
                instance=history,
                context={"request": self.request},
                many=True
            ).data

            set_of_topics = set(room["topic"]["title"] for room in serialized_rooms)
            set_of_languages = set(room["language"] for room in serialized_rooms)

            serialized_history = [
                history for history in serialized_history
                if history["topic"] in set_of_topics and history["language"] in set_of_languages
            ][:10]

            recommendations = recommendation_system.get_recommendations(history=serialized_history)

            rooms = rooms.annotate(
                recommendation_rating=Case(
                    *[When(id=room_id, then=Value(room_rating)) for room_id, room_rating in recommendations.items()],
                    output_field=IntegerField(),
                )
            ).order_by("-recommendation_rating", "-created_at")

        return rooms


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
