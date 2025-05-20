import React, { useEffect, useState, useContext } from 'react';
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/DoctorDashboard.css';

export default function PatientList({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    authFetch(`${process.env.REACT_APP_API_URL}/appointments/?doctor=${doctorId}&status=scheduled`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        // Собираем уникальных пациентов
        const uniq = Array.from(new Set(data.map(a => a.patient))).map(id =>
          data.find(a => a.patient === id)
        );
        setPatients(uniq);
      })
      .catch(console.error);
  }, [doctorId]);

  return (
    <div className="doctor-patient-list">
      <h3>Пациенты</h3>
      <ul>
        {patients.map(a => (
          <li key={a.patient}>{a.patient_name}</li>
        ))}
      </ul>
    </div>
  );
}
