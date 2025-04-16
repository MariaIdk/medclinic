from django.contrib import admin
from .models import (
    Patient, PatientDocument,
    Doctor, DoctorDocument,
    Service, ClinicSchedule,
    Appointment, License
)

admin.site.register(Patient)
admin.site.register(PatientDocument)
admin.site.register(Doctor)
admin.site.register(DoctorDocument)
admin.site.register(Service)
admin.site.register(ClinicSchedule)
admin.site.register(License)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        'patient', 'doctor', 'service', 'appointment_date', 'appointment_time', 'status', 'is_deleted'
    )
    list_filter = ('doctor', 'appointment_date', 'status', 'is_deleted')
    search_fields = (
        'patient__first_name', 'patient__last_name',
        'doctor__first_name', 'doctor__last_name',
        'service__name',
    )
    readonly_fields = ('created_at',)
    list_editable = ('status', 'is_deleted')

    def get_queryset(self, request):
        """Переопределим queryset, чтобы показывать и удалённые записи"""
        return super().get_queryset(request)
