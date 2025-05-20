import React, { useState, useEffect, useContext } from 'react';
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/DoctorDashboard.css';

export default function PersonalInfo({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    authFetch(`${process.env.REACT_APP_API_URL}/doctors/${doctorId}/`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setInfo)
      .catch(console.error);
  }, [doctorId]);
  

  if (!info) return <p>Загрузка...</p>;

  return (
    <div className="doctor-personal-info">
      <h3>Личная информация</h3>
      <p><strong>ФИО:</strong> {info.last_name} {info.first_name} {info.patronymic}</p>
      <p><strong>Специальность:</strong> {info.specialty_name}</p>
      <p><strong>Email:</strong> {info.email}</p>
      <p><strong>Телефон:</strong> {info.phone_number}</p>
      {/* ... другое по надобности */}
    </div>
  );
}
