import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext'; // Импортируем AuthContext
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import PatientDashboard from './components/PatientDashboard';
import HomePage from './components/HomePage';
import SchedulePage from "./components/SchedulePage";  // Импортируем компонент SchedulePage
import LicensePage from './components/LicensePage';

function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);

  // Проверка наличия токена для доступа к защищённому маршруту
  return accessToken ? children : <Navigate to="/login" replace />;
}

function App() {
  const { accessToken, userId } = useContext(AuthContext);

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