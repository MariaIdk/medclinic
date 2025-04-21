// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import PatientDashboard from './components/PatientDashboard';
// import HomePage from './components/HomePage'; // либо создайте этот компонент

function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? children : <Navigate to="/login" replace />;
}

function App() {
  // Читаем userId из контекста, а не из localStorage напрямую
  const { userId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PatientDashboard patientId={userId} />
            </PrivateRoute>
          }
        />

        {/* Если у вас есть домашняя страница */}
        <Route path="/" element={<div>HomePage</div>} />
        {/* либо: <Route path="/" element={<HomePage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
