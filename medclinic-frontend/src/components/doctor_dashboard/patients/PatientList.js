// src/components/doctor_dashboard/patients/PatientList.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../../api';
import { AuthContext } from '../../../contexts/AuthContext';
import '../../../styles/DoctorAppointments.css';

export default function PatientList({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        // 1. Получаем все приёмы этого врача кроме отменённых
        const res = await authFetch(
          `/api/appointments/?doctor=${doctorId}&status=all`
        );
        if (!res.ok) throw new Error('Не удалось загрузить приёмы');
        const appts = await res.json();
        // 2. Фильтруем по статусу !== 'cancelled'
        const valid = appts.filter(a => a.status !== 'cancelled');
        // 3. Группируем по patient.id + собираем первую запись с именем
        const map = {};
        valid.forEach(a => {
          if (!map[a.patient]) {
            map[a.patient] = {
              id: a.patient,
              name: a.patient_name,
              lastDate: a.appointment_date
            };
          } else {
            // обновляем дату последнего визита, если больше
            if (a.appointment_date > map[a.patient].lastDate) {
              map[a.patient].lastDate = a.appointment_date;
            }
          }
        });
        setPatients(Object.values(map));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) load();
  }, [doctorId, accessToken]);

  if (loading) return <p>Загрузка пациентов…</p>;
  if (error)   return <p className="error">Ошибка: {error}</p>;

  return (
    <div className="doctor-patient-list">
      <h2>Пациенты</h2>
      {patients.length === 0 ? (
        <p>Пациентов пока нет</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ФИО пациента</th>
              <th>Последний приём</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr
                key={p.id}
                className="clickable-row"
                onClick={() => navigate(`/doctor/patients/${p.id}`)}
              >
                <td>{p.name}</td>
                <td>{p.lastDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
