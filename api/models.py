from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    patronymic = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField()
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    address = models.TextField()


    def get_full_name(self):
        return f"{self.first_name} {self.last_name} {self.patronymic or ''}".strip()

    def __str__(self):
        return self.get_full_name()
    



class PatientDocument(models.Model):
    patient = models.ForeignKey(Patient, related_name='documents', on_delete=models.CASCADE)
    document_type = models.CharField(max_length=255)  # тип документа
    document_file = models.FileField(upload_to='patients/documents/')  # поле для PDF или других форматов
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.CharField(max_length=50, choices=[('patient', 'Patient'), ('doctor', 'Doctor')], default='patient')  # Кто прикрепил документ (Пациент или Врач)


    uploaded_by_doctor = models.ForeignKey(
    'Doctor',
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='uploaded_patient_documents'
    )


    def __str__(self):
        return f"Document for {self.patient.get_full_name()} ({self.document_type})"





class Visit(models.Model):
    patient = models.ForeignKey('Patient', related_name='visits', on_delete=models.CASCADE)
    doctor = models.ForeignKey('Doctor', related_name='visits', on_delete=models.CASCADE, null=False)
    visit_date = models.DateTimeField()
    visit_reason = models.TextField()
    is_cancelled = models.BooleanField(default=False)
    visit_notes = models.TextField(null=True, blank=True)
    conclusion = models.TextField(null=True, blank=True)
    documents = models.ManyToManyField('PatientDocument', related_name='visit_documents', blank=True)
    was_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Visit for {self.patient.get_full_name()} on {self.visit_date}"

    def clean(self):
        # Проверка врача
        overlapping_doctor = Visit.objects.filter(
            doctor=self.doctor,
            visit_date=self.visit_date
        ).exclude(pk=self.pk)

        if overlapping_doctor.exists():
            raise ValidationError("У этого врача уже запланирован приём в это время.")

        # Проверка пациента
        overlapping_patient = Visit.objects.filter(
            patient=self.patient,
            visit_date=self.visit_date
        ).exclude(pk=self.pk)

        if overlapping_patient.exists():
            raise ValidationError("У этого пациента уже назначен приём в это время.")

        # Если визит завершён, то visit_notes и conclusion должны быть обязательными
        if self.was_completed:
            if not self.visit_notes:
                raise ValidationError("Visit notes are required if the visit is completed.")
            if not self.conclusion:
                raise ValidationError("Conclusion is required if the visit is completed.")

    def save(self, *args, **kwargs):
        self.clean()  # Валидация перед сохранением

        super().save(*args, **kwargs)




class Doctor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    patronymic = models.CharField(max_length=100, blank=True, null=True)
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)

    previous_experience_years = models.PositiveIntegerField(default=0)  # Стаж до устройства
    hired_date = models.DateField(default=timezone.now)  # Дата устройства

    education = models.TextField()  # Образование: можно будет записывать как свободный текст

    def __str__(self):
        return f"{self.last_name} {self.first_name} ({self.specialty})"

    @property
    def total_experience_years(self):
        """Общий стаж (предыдущий + в клинике)"""
        delta = timezone.now().date() - self.hired_date
        return self.previous_experience_years + delta.days // 365




class DoctorDocument(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=255)  # тип документа
    document_file = models.FileField(upload_to='doctor/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Документ: {self.document_type} ({self.doctor})"