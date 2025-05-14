from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
from django.contrib.auth.models import User


class Patient(models.Model):

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='patient_profile'
    )


     
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
    description = models.CharField(max_length=255)  # тип документа
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
        return f"Document for {self.patient.get_full_name()} ({self.description})"



class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name




class Doctor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    patronymic = models.CharField(max_length=100, blank=True, null=True)
    # specialty = models.CharField(max_length=100)
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)
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
    description = models.CharField(max_length=255)  # тип документа
    document_file = models.FileField(upload_to='doctor/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Документ: {self.description} ({self.doctor})"
    


 

class Service(models.Model):
    direction = models.ForeignKey(Specialty, on_delete=models.CASCADE)  
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.direction} - {self.name}"
    

class ClinicSchedule(models.Model):
    WEEKDAYS = [
        (1, 'Понедельник'),
        (2, 'Вторник'),
        (3, 'Среда'),
        (4, 'Четверг'),
        (5, 'Пятница'),
        (6, 'Суббота'),
        (7, 'Воскресенье'),
    ]
    
    direction = models.ForeignKey(Specialty, on_delete=models.CASCADE) 
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    cabinet = models.CharField(max_length=10)
    weekday = models.IntegerField(choices=WEEKDAYS)
    specific_date = models.DateField(blank=True, null=True)  # если нужно для конкретного дня
    start_time = models.TimeField()
    end_time = models.TimeField()
    appointment_duration = models.PositiveIntegerField(default=15)  # длительность приёма в минутах

    def __str__(self):
        return f"{self.direction} - {self.doctor} ({self.get_weekday_display()})"



class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Назначен'),
        ('in_progress', 'Идет'),
        ('cancelled', 'Отменен'),
        ('completed', 'Проведен'),
        ('no_show', 'Пациент не пришел'),
    ]

    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey('Doctor', on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')

    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    documents = models.ManyToManyField('PatientDocument', related_name='appointments', blank=True)
    diagnosis = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)  # soft delete
    created_at = models.DateTimeField(auto_now_add=True)


    # def clean(self):
    #     """Проверка на пересечение по времени у врача и пациента"""
    #     start_dt = datetime.combine(self.appointment_date, self.appointment_time)

    #     # Получаем расписание врача на этот день недели
    #     weekday = self.appointment_date.isoweekday()  # 1 = Понедельник

    #     schedule = ClinicSchedule.objects.filter(
    #         doctor=self.doctor,
    #         weekday=weekday
    #     ).first()

    #     if not schedule:
    #         raise ValidationError("У врача нет расписания на этот день недели.")

    #     # Определим длительность приёма
    #     duration = schedule.appointment_duration or 15
    #     end_dt = start_dt + timedelta(minutes=duration)

    #     # Проверка пересечения у врача
    #     overlapping_for_doctor = Appointment.objects.filter(
    #         doctor=self.doctor,
    #         appointment_date=self.appointment_date,
    #     ).exclude(id=self.id).filter(
    #         appointment_time__lt=end_dt.time(),
    #     ).filter(
    #         appointment_time__gte=self.appointment_time
    #     )
    #     if overlapping_for_doctor.exists():
    #         raise ValidationError("У врача уже есть приём в это время.")

    #     # Проверка пересечения у пациента
    #     overlapping_for_patient = Appointment.objects.filter(
    #         patient=self.patient,
    #         appointment_date=self.appointment_date,
    #     ).exclude(id=self.id).filter(
    #         appointment_time__lt=end_dt.time(),
    #     ).filter(
    #         appointment_time__gte=self.appointment_time
    #     )
    #     if overlapping_for_patient.exists():
    #         raise ValidationError("У пациента уже есть приём в это время.")
    def clean(self):
        """Проверка на пересечение по времени у врача и пациента"""
        start_dt = datetime.combine(self.appointment_date, self.appointment_time)
        weekday = self.appointment_date.isoweekday()
        schedule = ClinicSchedule.objects.filter(
            doctor=self.doctor,
            weekday=weekday
        ).first()
        if not schedule:
            raise ValidationError("У врача нет расписания на этот день недели.")
        duration = schedule.appointment_duration or 15
        end_dt = start_dt + timedelta(minutes=duration)

        # учитываем только приёмы со статусом scheduled
        overlapping_for_doctor = Appointment.objects.filter(
            doctor=self.doctor,
            appointment_date=self.appointment_date,
            status='scheduled',
        ).exclude(id=self.id).filter(
            appointment_time__lt=end_dt.time(),
        ).filter(
            appointment_time__gte=self.appointment_time
        )
        if overlapping_for_doctor.exists():
            raise ValidationError("У врача уже есть приём в это время.")

        overlapping_for_patient = Appointment.objects.filter(
            patient=self.patient,
            appointment_date=self.appointment_date,
            status='scheduled',
        ).exclude(id=self.id).filter(
            appointment_time__lt=end_dt.time(),
        ).filter(
            appointment_time__gte=self.appointment_time
        )
        if overlapping_for_patient.exists():
            raise ValidationError("У пациента уже есть приём в это время.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient} - {self.appointment_date} {self.appointment_time} ({self.status})"
    


class License(models.Model):
    description = models.CharField(max_length=255)
    license_file = models.FileField(upload_to='licenses/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.description



