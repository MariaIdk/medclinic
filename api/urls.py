from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, VisitViewSet, DoctorViewSet, DoctorDocumentViewSet, PatientDocumentViewSet

router = DefaultRouter()


router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'doctor-documents', DoctorDocumentViewSet, basename='doctor-document')
router.register(r'patient-documents', PatientDocumentViewSet, basename='patient-document')


urlpatterns = router.urls


