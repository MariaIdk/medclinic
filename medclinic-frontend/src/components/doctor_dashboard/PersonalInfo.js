import React, { useState, useEffect, useContext } from 'react';
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/DoctorDashboard.css';

export default function DoctorPersonalInfo({ doctorId }) {
    const [doctor, setDoctor] = useState(null);
  
    useEffect(() => {
      authFetch(`${process.env.REACT_APP_API_URL}/doctors/${doctorId}/`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(setDoctor)
        .catch(console.error);
    }, [doctorId]);
  
    if (!doctor) return <p>Загрузка информации...</p>;
  
    return (
      <div>
        <h2>Мой профиль</h2>
        <p><strong>ФИО:</strong> {doctor.last_name} {doctor.first_name} {doctor.patronymic}</p>
        <p><strong>Специальность:</strong> {doctor.specialty.name}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Телефон:</strong> {doctor.phone_number}</p>
      </div>
    );
  }
