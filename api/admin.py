from django.contrib import admin
from .models import (
    Patient, PatientDocument,
    Doctor, DoctorDocument,
    Service, ClinicSchedule,
    Appointment, License,
    Specialty
)
from django import forms
from .forms import ClinicScheduleForm


from django.urls import reverse
from django.utils.safestring import mark_safe


admin.site.register(Patient)
admin.site.register(PatientDocument)
admin.site.register(Doctor)
admin.site.register(DoctorDocument)
admin.site.register(Service)
# admin.site.register(ClinicSchedule)
admin.site.register(License)
admin.site.register(Specialty)



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


# @admin.register(ClinicSchedule)
# class ClinicScheduleAdmin(admin.ModelAdmin):

#     def formfield_for_foreignkey(self, db_field, request, **kwargs):
#         if db_field.name == 'doctor':
#             # Попробуем получить id направления из запроса
#             direction_id = request.GET.get('direction')
#             if direction_id:
#                 kwargs["queryset"] = Doctor.objects.filter(specialty_id=direction_id)
#             else:
#                 kwargs["queryset"] = Doctor.objects.none()
#         return super().formfield_for_foreignkey(db_field, request, **kwargs)



class ClinicScheduleForm(forms.ModelForm):
    class Meta:
        model = ClinicSchedule
        fields = '__all__'

    class Media:
        js = ('api/js/filter_doctors.js',)

@admin.register(ClinicSchedule)
class ClinicScheduleAdmin(admin.ModelAdmin):
    form = ClinicScheduleForm