# mysite/routing.py
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from .consumers import ConferenceConsumer
from django.urls import re_path

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            [
                re_path(r'ws/conference_detail/(?P<room_name>\w+)/$', ConferenceConsumer)
            ]
        )
    ),
})
