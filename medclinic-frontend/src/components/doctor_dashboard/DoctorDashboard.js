// src/components/doctor_dashboard/DoctorDashboard.js
import React, { useState } from 'react';
import '../../styles/DoctorDashboard.css';


import PersonalInfo  from './PersonalInfo';
import MySchedule    from './MySchedule';
import PatientList   from './PatientList';

export default function DoctorDashboard({ doctorId }) {
  const [tab, setTab] = useState('info'); // 'info' | 'schedule' | 'patients'

  return (
    <div className="doctor-dashboard">
      <nav className="doctor-nav">
        <button onClick={() => setTab('info')}>Личная информация</button>
        <button onClick={() => setTab('schedule')}>Моё расписание</button>
        <button onClick={() => setTab('patients')}>Пациенты</button>
        <button onClick={() => {/* logout */}}>Выход</button>
      </nav>

      <div className="doctor-content">
        {tab === 'info'      && <PersonalInfo doctorId={doctorId} />}
        {tab === 'schedule'  && <MySchedule doctorId={doctorId} />}
        {tab === 'patients'  && <PatientList doctorId={doctorId} />}
      </div>
    </div>
  );
}
