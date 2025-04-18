from django import forms
from .models import ClinicSchedule, Doctor

class ClinicScheduleForm(forms.ModelForm):
    class Meta:
        model = ClinicSchedule
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Если направление уже выбрано (редактирование объекта)
        direction = self.initial.get('direction') or self.data.get('direction')

        if direction:
            self.fields['doctor'].queryset = Doctor.objects.filter(specialty_id=direction)
        else:
            self.fields['doctor'].queryset = Doctor.objects.none()
