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
    documents = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=PatientDocument.objects.all(),
        required=False  # <-- вот это ключевое
    )

    class Meta:
        model = Visit
        fields = '__all__'



class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'



class DoctorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorDocument
        fields = '__all__' 