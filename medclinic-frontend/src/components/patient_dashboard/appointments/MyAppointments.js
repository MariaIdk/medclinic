// src/components/patient_dashboard/appointments/MyAppointments.js
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
  const [services, setServices]         = useState([]);
  const [specialties, setSpecialties]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [dateFilter, setDateFilter]     = useState('');
  const [statusSelected, setStatusSelected]     = useState('all');
  const [directionSelected, setDirectionSelected] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError('Не авторизованы');
        setLoading(false);
        return;
      }
      try {
        // 1) fetch specialties
        const specRes = await authFetch('/api/specialties/');
        const specs = specRes.ok ? await specRes.json() : [];
        setSpecialties(specs);

        // 2) fetch services
        const svcRes = await authFetch('/api/services/');
        if (!svcRes.ok) throw new Error('Не удалось загрузить услуги');
        const svcs = await svcRes.json();
        setServices(svcs);

        // 3) fetch appointments
        const apptRes = await authFetch(
          `/api/appointments/?patient=${patientId}&status=all&ordering=appointment_date`
        );
        if (!apptRes.ok) throw new Error('Не удалось загрузить записи');
        const appts = await apptRes.json();

        // 4) enrich with service_name, direction and patient_name is already present
        const enriched = appts.map(a => {
          const svc = svcs.find(s => s.id === a.service) || {};
          return {
            ...a,
            service_name: svc.name || '',
            direction: svc.direction, // id of specialty
          };
        });

        setAppointments(enriched);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, accessToken]);

  if (loading) return <p>Загрузка...</p>;
  if (error)   return <p className="error">Ошибка: {error}</p>;

  // client-side filtering
  const filtered = appointments
    .filter(a =>
      // статус
      (statusSelected === 'all' || a.status === statusSelected)
    )
    .filter(a =>
      // дата
      (!dateFilter || a.appointment_date === dateFilter)
    )
    .filter(a =>
      // направление
      (directionSelected === 'all' || a.direction === +directionSelected)
    )
    .sort((a, b) => {
      const dc = a.appointment_date.localeCompare(b.appointment_date);
      if (dc !== 0) return sortAsc ? dc : -dc;
      const tc = a.appointment_time.localeCompare(b.appointment_time);
      return sortAsc ? tc : -tc;
    });

  return (
    <div className="my-appointments">

      {/* фильтры */}
      <div className="filters-row">
        <label>
          Дата:
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </label>
        <label>
          Статус:
          <select
            value={statusSelected}
            onChange={e => setStatusSelected(e.target.value)}
          >
            <option value="all">Все</option>
            {statusFilter.map(st => (
              <option key={st} value={st}>
                {st === 'scheduled' ? 'Назначен'
                  : st === 'in_progress' ? 'Идёт'
                  : st === 'completed' ? 'Завершён'
                  : st === 'cancelled' ? 'Отменён'
                  : st === 'no_show' ? 'Не пришёл'
                  : st}
              </option>
            ))}
          </select>
        </label>
        <label>
          Направление:
          <select
            value={directionSelected}
            onChange={e => setDirectionSelected(e.target.value)}
          >
            <option value="all">Все</option>
            {specialties.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        </label>
      </div>

      <table className="appointments-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Время</th>
            <th>Врач</th>
            <th>Услуга</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan="4">Записей нет</td></tr>
          )}
          {filtered.map(a => (
            <tr
              key={a.id}
              className={['cancelled','no_show'].includes(a.status)
                ? 'disabled-row'
                : 'clickable-row'}
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
