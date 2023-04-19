from django.urls import path

from .consumers import NotificationListConsumer, RoomConsumer, RoomListConsumer

websocket_urlpatterns = [
    path("ws/notification-list/", NotificationListConsumer.as_asgi()),
    path("ws/room-list/", RoomListConsumer.as_asgi()),
    path("ws/room/<title>/", RoomConsumer.as_asgi()),
]
