// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import RegistrationForm  from './components/auth/RegistrationForm';
import LoginForm         from './components/auth/LoginForm';
import HomePage          from './components/pages/HomePage';
import SchedulePage      from './components/pages/SchedulePage';
import LicensePage       from './components/pages/LicensePage';
import PatientDashboard  from './components/patient_dashboard/PatientDashboard';
import DoctorDashboard   from './components/doctor_dashboard/DoctorDashboard';

function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { role, patientProfileId, doctorProfileId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login"    element={<LoginForm />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/licenses" element={<LicensePage />} />

        {/* protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {role === 'doctor'
                ? doctorProfileId
                  ? <DoctorDashboard doctorId={doctorProfileId} />
                  : <p>Загрузка профиля врача…</p>
                : patientProfileId
                  ? <PatientDashboard patientId={patientProfileId} />
                  : <p>Загрузка профиля пациента…</p>
              }
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
