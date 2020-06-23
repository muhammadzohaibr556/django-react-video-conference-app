# chat/consumers.py
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
# from api.models import Notifications
User = get_user_model()


class ConferenceConsumer(WebsocketConsumer):
    def offer(self, data):
        content = {
            'command': 'set_offer',
            'offer': {'content': data['content'],'remote':data['localId'],'local': data['remoteId']}
        }
        return self.send_video_detail(content)

    def answer(self, data):
        content = {
            'command': 'set_answer',
            'answer': {'content': data['content'],'remote': data['localId'], 'local': data['remoteId']}
        }
        return self.send_video_detail(content)
    
    def candidate(self, data):
        content = {
            'command': 'set_candidate',
            'candidate': {'content': data['content'],'remote':data['localId'],'local': data['remoteId']}
        }
        return self.send_video_detail(content)
    
    def display(self, data):
        content = {
            'command': 'change_display',
            'id':data['localId']
            }
        return self.send_video_detail(content)

    def remove(self, data):
        content = {
            'command': 'remove'
        }
        return self.send_video_detail(content)

    commands = {
        'offer': offer,
        'answer': answer,
        'candidate': candidate,
        'display':display,
        'remove': remove
    }

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'course_chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

        # Send message to room group
    def send_video_detail(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'video_detail',
                'message': message
            }
        )

    # Receive message from room group
    def video_detail(self, event):
        message = event['message']
        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
