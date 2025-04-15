from rest_framework import serializers
from .models import Patient, PatientDocument, Visit, Doctor, DoctorDocument

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class PatientDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientDocument
        fields = '__all__'


class VisitSerializer(serializers.ModelSerializer):
    documents = PatientDocumentSerializer(many=True, required=False)
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    
    class Meta:
        model = Visit
        fields = '__all__'

    def validate(self, data):
        # Проверяем обязательность visit_notes и conclusion, если визит завершён
        if data.get('was_completed'):
            if not data.get('visit_notes'):
                raise serializers.ValidationError("Visit notes are required if the visit is completed.")
            if not data.get('conclusion'):
                raise serializers.ValidationError("Conclusion is required if the visit is completed.")
        return data


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class DoctorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorDocument
        fields = '__all__'



