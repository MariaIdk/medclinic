import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import RegistrationForm          from './components/auth/RegistrationForm';
import LoginForm                 from './components/auth/LoginForm';
import HomePage                  from './components/pages/HomePage';
import SchedulePage              from './components/pages/SchedulePage';
import LicensePage               from './components/pages/LicensePage';
import PatientDashboard          from './components/patient_dashboard/PatientDashboard';
import DoctorDashboard           from './components/doctor_dashboard/DoctorDashboard';
import DoctorAppointmentEdit     from './components/doctor_dashboard/DoctorAppointmentEdit';
import PatientAppointmentDetail  from './components/patient_dashboard/appointments/PatientAppointmentDetail';
import PatientList               from './components/doctor_dashboard/patients/PatientList';
import PatientDetail             from './components/doctor_dashboard/patients/PatientDetail';

function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { role, patientProfileId, doctorProfileId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/register"  element={<RegistrationForm />} />
        <Route path="/login"     element={<LoginForm />} />
        <Route path="/schedule"  element={<SchedulePage />} />
        <Route path="/licenses"  element={<LicensePage />} />

        {/* Кабинет врача: редактирование приёма */}
        <Route
          path="/doctor/appointments/:id/edit"
          element={
            <PrivateRoute>
              <DoctorAppointmentEdit />
            </PrivateRoute>
          }
        />

        {/* Кабинет врача: список пациентов */}
        <Route
          path="/doctor/patients"
          element={
            <PrivateRoute>
              {doctorProfileId
                ? <PatientList doctorId={doctorProfileId} />
                : <p>Загрузка профиля врача…</p>
              }
            </PrivateRoute>
          }
        />

        {/* Кабинет врача: детали пациента */}
        <Route
          path="/doctor/patients/:patientId"
          element={
            <PrivateRoute>
              <PatientDetail />
            </PrivateRoute>
          }
        />

        {/* Protected: общий дашборд (врача или пациента) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {role === 'doctor'
                ? (doctorProfileId
                    ? <DoctorDashboard doctorId={doctorProfileId} />
                    : <p>Загрузка профиля врача…</p>
                  )
                : (patientProfileId
                    ? <PatientDashboard patientId={patientProfileId} />
                    : <p>Загрузка профиля пациента…</p>
                  )
              }
            </PrivateRoute>
          }
        />

        {/* Страница с деталями приёма для пациента */}
        <Route
          path="/appointments/:id"
          element={
            <PrivateRoute>
              <PatientAppointmentDetail />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
