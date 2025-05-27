import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/MyAppointments.css';
import { authFetch } from '../../../api';
import { AuthContext } from '../../../contexts/AuthContext';

export default function MyAppointments({
  patientId,
  statusFilter = ['scheduled','in_progress','completed','cancelled','no_show'],
  sortAsc = false
}) {
  const { accessToken } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) { setError('Не авторизованы'); setLoading(false); return; }
      try {
        const svcRes = await authFetch('/api/services/');
        if (!svcRes.ok) throw new Error('Не удалось загрузить услуги');
        const svcs = await svcRes.json();
        setServices(svcs);

        const apptRes = await authFetch(
          `/api/appointments/?patient=${patientId}&status=all&ordering=appointment_date`
        );
        if (!apptRes.ok) throw new Error('Не удалось загрузить записи');
        const appts = await apptRes.json();

        const withNames = appts.map(a => ({
          ...a,
          service_name: (svcs.find(s => s.id === a.service) || {}).name || ''
        }));
        // фильтр + сортировка...
        const filtered = withNames
          .filter(a => statusFilter.includes(a.status))
          .sort((a,b) => {
            const dc = a.appointment_date.localeCompare(b.appointment_date);
            if (dc !== 0) return sortAsc ? dc : -dc;
            const tc = a.appointment_time.localeCompare(b.appointment_time);
            return sortAsc ? tc : -tc;
          });
        setAppointments(filtered);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, statusFilter, sortAsc, accessToken]);

  if (loading) return <p>Загрузка...</p>;
  if (error)   return <p className="error">Ошибка: {error}</p>;

  return (
    <div className="my-appointments">
      <h2>Мои записи</h2>
      <table className="appointments-table">
        <thead>
          <tr><th>Дата</th><th>Время</th><th>Врач</th><th>Услуга</th></tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr><td colSpan="4">Записей нет</td></tr>
          )}
          {appointments.map(a => (
            <tr
              key={a.id}
              className={['cancelled','no_show'].includes(a.status)?'disabled-row':'clickable-row'}
              onClick={() => navigate(`/appointments/${a.id}`)}
            >
              <td>{a.appointment_date}</td>
              <td>{a.appointment_time.slice(0,5)}</td>
              <td>{a.doctor_name}</td>
              <td>{a.service_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
