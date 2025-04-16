from rest_framework import serializers
from .models import (
    Patient,
    PatientDocument,
    Doctor,
    DoctorDocument,
    Service,
    ClinicSchedule,
    Appointment,
    License
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class PatientDocumentSerializer(serializers.ModelSerializer):
    # Здесь document_type переименован в description, если требуется, можно добавить дополнительные методы, если нужно
    class Meta:
        model = PatientDocument
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class DoctorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorDocument
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ClinicScheduleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    
    class Meta:
        model = ClinicSchedule
        fields = '__all__'
        # Если хочется добавить отображение дня недели, например: 
        # fields = ['id', 'direction', 'doctor', 'cabinet', 'weekday', 'weekday_display', 'specific_date', 'start_time', 'end_time', 'appointment_duration']


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
    class Meta:
        model = License
        fields = '__all__'
