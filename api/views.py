from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Patient, PatientDocument, Visit, Doctor, DoctorDocument
from .serializers import PatientSerializer, PatientDocumentSerializer, VisitSerializer, DoctorSerializer, DoctorDocumentSerializer



class PatientViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing patient instances.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer  
    

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        patient = self.get_object()
        documents = patient.documents.all()
        serializer = PatientDocumentSerializer(documents, many=True)
        return Response(serializer.data)






class PatientDocumentViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing patient document instances.
    """
    queryset = PatientDocument.objects.all()
    serializer_class = PatientDocumentSerializer

    def get_queryset(self):
        return self.queryset.all()

    @action(detail=False, methods=['post'])
    def upload_document(self, request):
        """
        Загружаем документ для пациента.
        """
        patient_id = request.data.get('patient_id')
        patient = get_object_or_404(Patient, id=patient_id)
        document_file = request.FILES.get('document_file')
        document_type = request.data.get('document_type', 'анализы')
        uploaded_by = request.data.get('uploaded_by', 'patient')

        new_document = PatientDocument.objects.create(
            patient=patient,
            document_file=document_file,
            document_type=document_type,
            uploaded_by=uploaded_by
        )
        return Response(PatientDocumentSerializer(new_document).data)
    
    

  

class VisitViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing visit instances.
    """
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer

    def get_queryset(self):
        """
        Фильтруем визиты по пациенту.
        """
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return Visit.objects.filter(patient_id=patient_id)
        return Visit.objects.all()

    @action(detail=True, methods=['post'])
    def add_conclusion_and_documents(self, request, pk=None):
        """
        Добавляем заключение и документы для посещения.
        """
        visit = self.get_object()
        conclusion = request.data.get('conclusion')
        document_files = request.FILES.getlist('documents')  # Получаем список файлов документов
        uploaded_by = request.data.get('uploaded_by', 'doctor')  # Загружающий (врач по умолчанию)

        # Добавляем заключение
        visit.conclusion = conclusion
        visit.was_completed = True  # Помечаем визит как завершённый
        visit.save()

        # Добавляем документы в визит
        for document_file in document_files:
            document_type = request.data.get('document_type')  # Тип документа, например "анализы"
            document = PatientDocument.objects.create(
                patient=visit.patient,
                document_file=document_file,
                document_type=document_type,
                uploaded_by=uploaded_by
            )
            visit.documents.add(document)

        return Response(VisitSerializer(visit).data)


class DoctorViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing doctor instances.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class DoctorDocumentViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing doctor document instances.
    """
    queryset = DoctorDocument.objects.all()
    serializer_class = DoctorDocumentSerializer

    def get_queryset(self):
        """
        Фильтруем документы по врачу.
        """
        doctor_id = self.kwargs.get('doctor_id')
        if doctor_id:
            return self.queryset.filter(doctor__id=doctor_id)
        return self.queryset

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """
        Загружаем документ для врача.
        """
        doctor = self.get_object()
        document_file = request.data.get('document_file')
        document_type = request.data.get('document_type')
        uploaded_by = request.user  # Загружающий врач

        # Создаём новый документ
        new_document = DoctorDocument.objects.create(
            doctor=doctor,
            document_file=document_file,
            document_type=document_type,
            uploaded_by=uploaded_by
        )

        return Response(DoctorDocumentSerializer(new_document).data)
