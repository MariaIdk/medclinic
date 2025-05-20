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

function App() {
  const { role, userId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/licenses" element={<LicensePage />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {role === 'doctor'
                ? <DoctorDashboard doctorId={userId} />
                : <PatientDashboard patientId={userId} />
              }
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
