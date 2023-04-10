import hashlib
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class RoomListConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group = "room-list"

        await self.channel_layer.group_add(
            self.group,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data):
        await self.channel_layer.group_send(
            self.group,
            json.loads(text_data)
        )

    async def disconnect(self, _):
        await self.channel_layer.group_discard(
            self.group,
            self.channel_name
        )

    async def room_list_update(self, event):
        await self.send(text_data=json.dumps(event))


class RoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group = f"room-{hashlib.sha256(self.scope['url_route']['kwargs']['title'].encode()).hexdigest()}"

        await self.channel_layer.group_add(
            self.group,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, _):
        await self.channel_layer.group_discard(
            self.group,
            self.channel_name
        )

    async def room_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def room_delete(self, event):
        await self.send(text_data=json.dumps(event))
