import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import RegistrationForm from './components/auth/RegistrationForm';
import LoginForm        from './components/auth/LoginForm';
import PatientDashboard from './components/patient_dashboard/PatientDashboard';
import HomePage         from './components/pages/HomePage';
import SchedulePage     from './components/pages/SchedulePage';
import LicensePage      from './components/pages/LicensePage';


function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);

  // Проверка наличия токена для доступа к защищённому маршруту
  return accessToken ? children : <Navigate to="/login" replace />;
}

function App() {
  const { accessToken, userId } = useContext(AuthContext);
  //const { userId } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<HomePage />} />
        
        {/* Страница регистрации */}
        <Route path="/register" element={<RegistrationForm />} />
        
        {/* Страница входа */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Личный кабинет (защищённый маршрут) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PatientDashboard patientId={userId} />
            </PrivateRoute>
          }
        />
        <Route path="/schedule" element={<SchedulePage />} />  {/* Новый маршрут для расписания */}
        
        <Route path="/licenses" element={<LicensePage />} />
        
        {/* Дополнительные страницы, например, лицензии и расписание */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;