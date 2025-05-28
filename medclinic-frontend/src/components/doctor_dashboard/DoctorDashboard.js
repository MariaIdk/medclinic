// src/components/doctor_dashboard/DoctorDashboard.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';

import DoctorPersonalInfo from './DoctorPersonalInfo';
import DoctorSchedule     from './schedule/DoctorSchedule';
import DoctorAppointments        from './DoctorAppointments';
import PatientList        from './patients/PatientList';

export default function DoctorDashboard({ doctorId }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('personal');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <ul>
          <li
            className={tab === 'personal' ? 'active' : ''}
            onClick={() => setTab('personal')}
          >
            Личная информация
          </li>
          <li
            className={tab === 'schedule' ? 'active' : ''}
            onClick={() => setTab('schedule')}
          >
            Моё расписание
          </li>
          <li
            className={tab === 'appointments' ? 'active' : ''}
            onClick={() => setTab('appointments')}
          >
            Записи
          </li>
          <li
            className={tab === 'patients' ? 'active' : ''}
            onClick={() => setTab('patients')}
          >
            Пациенты
          </li>
          <li onClick={handleLogout}>
            Выйти
          </li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {tab === 'personal' && (
          <DoctorPersonalInfo doctorId={doctorId} />
        )}
        {tab === 'schedule' && (
          <DoctorSchedule doctorId={doctorId} />
        )}
        {tab === 'appointments' && (
          <DoctorAppointments doctorId={doctorId} />
        )}
        {tab === 'patients' && (
          <PatientList doctorId={doctorId} />
        )}
      </main>
    </div>
  );
}
