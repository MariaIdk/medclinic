// src/components/doctor_dashboard/DoctorDashboard.js
import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import PersonalInfo from './PersonalInfo';
import MySchedule from './MySchedule';
import PatientList from './PatientList';

export default function DoctorDashboard({ doctorId }) {
  const [section, setSection] = useState('personalInfo');
  const [scheduleView, setScheduleView] = useState('slots'); // 'slots' или 'appointments'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));

  const renderContent = () => {
    switch (section) {
      case 'personalInfo':
        return <PersonalInfo doctorId={doctorId} />;
      case 'schedule':
        return (
          <MySchedule
            doctorId={doctorId}
            view={scheduleView}
            onViewChange={setScheduleView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        );
      case 'patients':
        return <PatientList doctorId={doctorId} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <ul>
          <li onClick={() => setSection('personalInfo')}
              className={section==='personalInfo'?'active':''}>
            Личная информация
          </li>
          <li onClick={() => setSection('schedule')}
              className={section==='schedule'?'active':''}>
            Моё расписание
          </li>
          <li onClick={() => setSection('patients')}
              className={section==='patients'?'active':''}>
            Пациенты
          </li>
          <li onClick={() => { /* сюда logout */ }}>
            Выйти
          </li>
        </ul>
      </aside>
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
}
