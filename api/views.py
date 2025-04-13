from rest_framework import viewsets
from .models import Patient, PatientDocument, Visit, Doctor, DoctorDocument
from .serializers import PatientSerializer, PatientDocumentSerializer ,VisitSerializer, DoctorSerializer, DoctorDocumentSerializer
from rest_framework.response import Response
from rest_framework.decorators import action



class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer





class PatientDocumentViewSet(viewsets.ModelViewSet):
    queryset = PatientDocument.objects.all()
    serializer_class = PatientDocumentSerializer

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return self.queryset.filter(patient__id=patient_id)

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        patient = self.get_object()
        document_file = request.data.get('document_file')
        document_type = request.data.get('document_type')
        uploaded_by = request.data.get('uploaded_by')  # Загружающий пользователь (пациент или врач)

        new_document = PatientDocument.objects.create(
            patient=patient,
            document_file=document_file,
            document_type=document_type,
            uploaded_by=uploaded_by
        )
        return Response(PatientDocumentSerializer(new_document).data)





class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return Visit.objects.filter(patient_id=patient_id)
        return Visit.objects.all() 


    @action(detail=True, methods=['post'])
    def add_conclusion_and_documents(self, request, pk=None):
        visit = self.get_object()
        conclusion = request.data.get('conclusion')
        document_files = request.FILES.getlist('documents')  # Загружаем несколько документов
        uploaded_by = request.data.get('uploaded_by', 'doctor')  # Кто прикрепил документы

        # Добавляем заключение
        visit.conclusion = conclusion
        visit.was_completed = True  # Помечаем прием как завершенный
        visit.save()

        # Добавляем документы в посещение
        for document_file in document_files:
            document_type = request.data.get('document_type')  # Тип документа, например, "анализы"
            document = PatientDocument.objects.create(
                patient=visit.patient,
                document_file=document_file,
                document_type=document_type,
                uploaded_by=uploaded_by
            )
            visit.documents.add(document)
        
        return Response(VisitSerializer(visit).data)
    

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer



class DoctorDocumentViewSet(viewsets.ModelViewSet):
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
        Загружаем документ для конкретного врача.
        """
        doctor = self.get_object()
        document_file = request.data.get('document_file')
        document_type = request.data.get('document_type')
        uploaded_by = request.user  # Врач, который загружает документ

        # Создаем новый документ
        new_document = DoctorDocument.objects.create(
            doctor=doctor,
            document_file=document_file,
            document_type=document_type,
            uploaded_by=uploaded_by
        )

        # Отправляем обратно сериализованные данные документа
        return Response(DoctorDocumentSerializer(new_document).data)