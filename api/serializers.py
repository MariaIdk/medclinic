from rest_framework import serializers
from .models import (
    Patient,
    PatientDocument,
    Doctor,
    DoctorDocument,
    Service,
    ClinicSchedule,
    Appointment,
    License,
    Specialty,
    User
)

from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'




# class DoctorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Doctor
#         fields = ['id', 'first_name', 'last_name', 'patronymic', 'specialty']
class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name']

# class DoctorSerializer(serializers.ModelSerializer):
#     specialty = SpecialtySerializer(read_only=True)
#     email = serializers.EmailField(read_only=True)
#     phone_number = serializers.CharField(read_only=True)

#     class Meta:
#         model = Doctor
#         fields = [
#             'id',
#             'first_name',
#             'last_name',
#             'patronymic',
#             'specialty',
#             'email',
#             'phone_number',
#         ]

class DoctorSerializer(serializers.ModelSerializer):
    specialty               = SpecialtySerializer(read_only=True)
    email                   = serializers.EmailField(required=True)
    phone_number            = serializers.CharField(required=True)
    education               = serializers.CharField(required=True)
    hired_date              = serializers.DateField(read_only=True)
    total_experience_years  = serializers.IntegerField(read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id',
            'first_name',
            'last_name',
            'patronymic',
            'specialty',
            'email',
            'phone_number',
            'hired_date',
            'total_experience_years',
            'education',
        ]
        read_only_fields = ['specialty', 'hired_date', 'total_experience_years']





class PatientDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = PatientDocument
        fields = ['id', 'patient', 'description', 'document_file', 'created_at', 'uploaded_by', 'uploaded_by_doctor']


class DoctorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorDocument
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ClinicScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.__str__', read_only=True)
    class Meta:
        model = ClinicSchedule
        fields = [
            'id', 'direction', 'doctor', 'doctor_name',
            'cabinet', 'weekday', 'start_time', 'end_time', 'appointment_duration'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    # documents можно выводить как связанные объекты; если нужны подробности, используем PatientDocumentSerializer
    documents = PatientDocumentSerializer(many=True, required=False)
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'service',
            'appointment_date',
            'appointment_time',
            'reason',
            'status',
            'documents',
            'diagnosis',
            'recommendations',
            'is_deleted',
            'created_at'
        ]
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name() if obj.patient else ''
    
    def get_doctor_name(self, obj):
        return str(obj.doctor) if obj.doctor else ''


class LicenseSerializer(serializers.ModelSerializer):
    # Передаем URL для файла
    license_file_url = serializers.SerializerMethodField()

    class Meta:
        model = License
        fields = ['id', 'description', 'license_file', 'license_file_url']

    def get_license_file_url(self, obj):
        # Создаем ссылку на файл
        if obj.license_file:
            return obj.license_file.url
        return None

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = '__all__'


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user