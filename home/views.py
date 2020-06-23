from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username',)
        read_only_fields = ('username',)


class UsersAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get(self, request, format=None):
        queryset = User.objects.exclude(id=request.user.id)
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)