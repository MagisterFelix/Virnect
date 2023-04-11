from django.urls import path

from .consumers import NotificationListConsumer, RoomConsumer, RoomListConsumer

websocket_urlpatterns = [
    path("room-list/", RoomListConsumer.as_asgi()),
    path("room/<title>/", RoomConsumer.as_asgi()),
    path("notification-list/<username>/", NotificationListConsumer.as_asgi()),
]
