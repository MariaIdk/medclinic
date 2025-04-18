from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    PatientViewSet,
    PatientDocumentViewSet,
    DoctorViewSet,
    DoctorDocumentViewSet,
    ServiceViewSet,
    ClinicScheduleViewSet,
    AppointmentViewSet,
    LicenseViewSet,
    ScheduleUploadView,
)
from . import views

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'patient-documents', PatientDocumentViewSet, basename='patient-document')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'doctor-documents', DoctorDocumentViewSet, basename='doctor-document')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'clinic-schedules', ClinicScheduleViewSet, basename='clinic-schedule')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'licenses', LicenseViewSet, basename='license')

urlpatterns = router.urls



urlpatterns += [
    path('upload-schedule/', ScheduleUploadView.as_view(), name='upload-schedule'),
    path('ajax/get-doctors/', views.get_doctors_by_specialty, name='get_doctors_by_specialty'),
]