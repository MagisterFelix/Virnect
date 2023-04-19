import json
import urllib

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import PermissionDenied

from .models import Room
from .serializers import ConnectingSerializer, DisconnectingSerializer
from .utils import AuthorizationUtils, WebSocketUtils


class NotificationListConsumer(AsyncJsonWebsocketConsumer):

    group = None

    async def connect(self):
        token = self.scope["cookies"].get("access_token")

        user_id = AuthorizationUtils.get_user_id(token=token)

        if user_id is None:
            await self.close(code=403)
            return None

        self.group = f"notification-list-{user_id}"

        await self.channel_layer.group_add(self.group, self.channel_name)

        await self.accept()

    async def disconnect(self, _):
        if self.group is None:
            return None

        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def notification_list_update(self, event):
        await self.send_json(content=event)


class RoomListConsumer(AsyncJsonWebsocketConsumer):

    group = "room-list"

    async def connect(self):
        token = self.scope["cookies"].get("access_token")

        user_id = AuthorizationUtils.get_user_id(token=token)

        if user_id is None:
            await self.close(code=403)
            return None

        await self.channel_layer.group_add(self.group, self.channel_name)

        await self.accept()

    async def receive(self, text_data):
        await self.channel_layer.group_send(self.group, json.loads(text_data))

    async def disconnect(self, _):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def room_list_update(self, event):
        await self.send_json(event)


class RoomConsumer(AsyncJsonWebsocketConsumer):

    group = None

    async def connect(self):
        self.room = await sync_to_async(Room.objects.get_or_none)(title=self.scope["url_route"]["kwargs"]["title"])

        if self.room is None:
            await self.close(code=404)
            return None

        token = self.scope["cookies"].get("access_token")

        user_id = AuthorizationUtils.get_user_id(token=token)

        if user_id is None:
            await self.close(code=403)
            return None

        query_params = urllib.parse.parse_qs(self.scope["query_string"].decode())
        key = query_params.get("key", [None])[0]

        self.data = {
            "user": user_id,
        }

        if key is not None:
            self.data["key"] = key

        serializer = await sync_to_async(ConnectingSerializer)(instance=self.room, data=self.data)

        try:
            await sync_to_async(serializer.is_valid)()
        except PermissionDenied:
            await self.close(code=403)
            return None

        await sync_to_async(serializer.save)()

        self.group = f"room-{self.room.id}"

        await self.channel_layer.group_add(self.group, self.channel_name)

        await self.accept()

        await sync_to_async(WebSocketUtils.update_room)(room_id=self.room.id, room_title=self.room.title)
        await sync_to_async(WebSocketUtils.update_room_list)()

    async def disconnect(self, _):
        if self.group is None:
            return None

        serializer = await sync_to_async(DisconnectingSerializer)(instance=self.room, data=self.data)

        try:
            await sync_to_async(serializer.is_valid)()
        except PermissionDenied:
            return None

        await sync_to_async(serializer.save)()

        await self.channel_layer.group_discard(self.group, self.channel_name)

        await sync_to_async(WebSocketUtils.update_room)(room_id=self.room.id, room_title=self.room.title)
        await sync_to_async(WebSocketUtils.update_room_list)()

    async def room_update(self, event):
        self.room = await sync_to_async(Room.objects.get_or_none)(title=event["room"])

        await self.send_json(event)

    async def room_delete(self, event):
        await self.send_json(event)
