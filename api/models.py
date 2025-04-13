from django.db import models

class Patient(models.Model):
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.full_name



class PatientDocument(models.Model):
    patient = models.ForeignKey(Patient, related_name='documents', on_delete=models.CASCADE)
    document_type = models.CharField(max_length=255)  # тип документа
    document_file = models.FileField(upload_to='patients/documents/')  # поле для PDF или других форматов
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.patient.full_name} ({self.document_type})"



class Visit(models.Model):
    patient = models.ForeignKey(Patient, related_name='visits', on_delete=models.CASCADE)
    doctor = models.ForeignKey('Doctor', related_name='visits', on_delete=models.SET_NULL, null=True)  # Связь с доктором через ID
    visit_date = models.DateTimeField()
    visit_reason = models.TextField()
    is_cancelled = models.BooleanField(default=False)
    visit_notes = models.TextField(null=True, blank=True)  # Записи по результатам осмотра/диагноз
    conclusion = models.TextField(null=True, blank=True)  # Заключение врача
    documents = models.ManyToManyField(PatientDocument, related_name='visit_documents', blank=True)  # Связь с документами

    def __str__(self):
        return f"Visit for {self.patient.full_name} on {self.visit_date}"

    def save(self, *args, **kwargs):
        # Если запись не отменена и дата посещения прошла, добавляем в историю
        if not self.is_cancelled and self.visit_date <= timezone.now():
            super().save(*args, **kwargs)
            # Автоматически добавляем документы в личные документы пациента
            for document in self.documents.all():
                document.patient.documents.add(document)
        else:
            super().save(*args, **kwargs)
