// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import PatientDashboard from './components/PatientDashboard';
import HomePage from './components/HomePage';

function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? children : <Navigate to="/login" replace />;
}

function App() {
  const { userId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<PrivateRoute><PatientDashboard patientId={userId} /></PrivateRoute>} />
        {/* Добавьте по желанию: лицензии, расписание */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
