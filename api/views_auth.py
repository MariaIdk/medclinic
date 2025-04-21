from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer, CharField


class RegisterSerializer(ModelSerializer):
    password = CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Регистрация прошла успешно'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
