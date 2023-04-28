from django.urls import path

from .consumers import ProfileConsumer, RoomConsumer, RoomListConsumer

websocket_urlpatterns = [
    path("ws/profile/", ProfileConsumer.as_asgi()),
    path("ws/room-list/", RoomListConsumer.as_asgi()),
    path("ws/room/<title>/", RoomConsumer.as_asgi()),
]
