from django.contrib.auth.models import User
from rest_framework import serializers, generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Patient

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    patronymic = serializers.CharField(allow_blank=True, required=False)
    date_of_birth = serializers.DateField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    address = serializers.CharField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Этот логин уже занят")
        return value

    def validate_email(self, value):
        if Patient.objects.filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже зарегистрирован")
        return value

    def validate_phone_number(self, value):
        if Patient.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Этот номер уже используется")
        return value

    def create(self, validated_data):
        # создаём пользователя
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email']
        )
        # создаём профиль пациента
        Patient.objects.create(
            user=user,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            patronymic=validated_data.get('patronymic', ''),
            date_of_birth=validated_data['date_of_birth'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            address=validated_data['address']
        )
        return user

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Регистрация успешна"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
