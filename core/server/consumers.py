import urllib

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import PermissionDenied

from .models import Room, User
from .serializers import ConnectingSerializer, DisconnectingSerializer
from .utils import AuthorizationUtils, WebSocketUtils


class ProfileConsumer(AsyncJsonWebsocketConsumer):

    group = None

    async def connect(self):
        token = self.scope["cookies"].get("access_token")

        user_id = AuthorizationUtils.get_user_id(token=token)

        if user_id is None:
            await self.close(code=403)
            return None

        self.user = await sync_to_async(User.objects.get_or_none)(pk=user_id)

        if self.user is None or not self.user.is_active:
            await self.close(code=403)
            return None

        self.group = f"profile-{user_id}"

        await sync_to_async(self.user.set_online)()

        await self.channel_layer.group_add(self.group, self.channel_name)

        await self.accept()

    async def disconnect(self, _):
        if self.group is None:
            return None

        await sync_to_async(self.user.set_offline)()

        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def notification_list_update(self, event):
        await self.send_json(content=event)

    async def ban(self, event):
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

    async def receive_json(self, content):
        await self.channel_layer.group_send(self.group, content)

    async def disconnect(self, _):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def room_list_update(self, event):
        await self.send_json(event)


class RoomConsumer(AsyncJsonWebsocketConsumer):

    group = None
    kicked_users = dict()
    voice_chat_users = dict()

    async def connect(self):
        self.room = await sync_to_async(Room.objects.get_or_none)(title=self.scope["url_route"]["kwargs"]["title"])

        if self.room is None:
            await self.close(code=404)
            return None

        self.group = f"room-{self.room.id}"

        self.kicked_users[self.group] = self.kicked_users.get(self.group, set())
        self.voice_chat_users[self.group] = self.voice_chat_users.get(self.group, dict())

        token = self.scope["cookies"].get("access_token")

        user_id = AuthorizationUtils.get_user_id(token=token)
        self.user = user_id

        if self.user is None or self.user in self.kicked_users[self.group]:
            await self.close(code=403)
            return None

        query_params = urllib.parse.parse_qs(self.scope["query_string"].decode())
        key = query_params.get("key", [None])[0]

        data = {
            "user": self.user
        }

        if key is not None:
            data["key"] = key

        serializer = await sync_to_async(ConnectingSerializer)(instance=self.room, data=data)

        try:
            await sync_to_async(serializer.is_valid)()
        except PermissionDenied:
            await self.close(code=403)
            return None

        await sync_to_async(serializer.save)()

        await self.channel_layer.group_add(self.group, self.channel_name)

        await self.accept()

        await sync_to_async(WebSocketUtils.connect_room)(room_id=self.room.id)
        await sync_to_async(WebSocketUtils.update_room_list)()

    async def disconnect(self, _):
        if self.group is None:
            return None

        if self.user in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group].pop(self.user)

        if await sync_to_async(lambda: self.user == self.room.host.id)():
            self.kicked_users[self.group].clear()

        data = {
            "user": self.user
        }

        serializer = await sync_to_async(DisconnectingSerializer)(instance=self.room, data=data)

        try:
            await sync_to_async(serializer.is_valid)()
        except PermissionDenied:
            return None

        await sync_to_async(serializer.save)()

        await self.channel_layer.group_discard(self.group, self.channel_name)

        await sync_to_async(WebSocketUtils.disconnect_room)(room_id=self.room.id)
        await sync_to_async(WebSocketUtils.update_room_list)()

    async def receive_json(self, content):
        await self.channel_layer.group_send(self.group, content)

    async def room_connect(self, event):
        event["voice_chat_users"] = list(self.voice_chat_users[self.group].values())
        await self.send_json(event)

    async def room_disconnect(self, event):
        event["voice_chat_users"] = list(self.voice_chat_users[self.group].values())
        await self.send_json(event)

    async def room_update(self, event):
        self.room = await sync_to_async(Room.objects.get_or_none)(title=event["room"])

        if "user" in event.keys() and event["user"]["id"] in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group][event["user"]["id"]]["username"] = event["user"]["username"]
            self.voice_chat_users[self.group][event["user"]["id"]]["image"] = event["user"]["image"]

            event["user"] = event["user"]["id"]

        event["voice_chat_users"] = list(self.voice_chat_users[self.group].values())

        await self.send_json(event)

    async def room_delete(self, event):
        await self.send_json(event)

    async def user_kick(self, event):
        self.kicked_users[self.group].add(event["user"])
        await self.send_json(event)

    async def message_send(self, event):
        await self.send_json(event)

    async def message_edit(self, event):
        await self.send_json(event)

    async def message_delete(self, event):
        await self.send_json(event)

    async def voice_chat_connect(self, event):
        if event["user"]["id"] not in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group][event["user"]["id"]] = event["user"]

        event["voice_chat_users"] = list(self.voice_chat_users[self.group].values())

        await self.send_json(event)

    async def voice_chat_toggle_speaking(self, event):
        if event["user"] in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group][event["user"]]["is_speaking"] = event["is_speaking"]

        await self.send_json(event)

    async def voice_chat_toggle_mic(self, event):
        if event["user"] in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group][event["user"]]["is_muted"] = event["is_muted"]

        await self.send_json(event)

    async def voice_chat_signal(self, event):
        await self.send_json(event)

    async def voice_chat_disconnect(self, event):
        if event["user"] in self.voice_chat_users[self.group]:
            self.voice_chat_users[self.group].pop(event["user"])

        event["voice_chat_users"] = list(self.voice_chat_users[self.group].values())

        await self.send_json(event)
