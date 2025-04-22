// src/components/MyAppointments.js
import React, { useState, useEffect, useContext } from 'react';
import './MyAppointments.css';
import { authFetch } from './api';               // authFetch из api/index.js
import { AuthContext } from '../contexts/AuthContext';
import PatientDocumentList from './PatientDocumentList';

export default function MyAppointments({
  patientId,
  statusFilter = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
  sortAsc = false
}) {
  const { accessToken } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      try {
        // 1. Загружаем услуги
        const svcRes = await authFetch('http://localhost:8000/api/services/');
        if (!svcRes.ok) throw new Error('Ошибка загрузки списка услуг');
        const servicesData = await svcRes.json();
        setServices(servicesData);

        // 2. Загружаем приёмы пациента
        const apptRes = await authFetch(
          `http://localhost:8000/api/appointments/?patient=${patientId}&ordering=appointment_date`
        );
        if (!apptRes.ok) throw new Error('Ошибка загрузки записей');
        const appts = await apptRes.json();
        if (!Array.isArray(appts)) throw new Error('Неверный формат записей');

        // 3. Привязываем имя услуги
        const apptsWithService = appts.map(appt => {
          const svc = servicesData.find(s => s.id === appt.service);
          return {
            ...appt,
            service_name: svc ? svc.name : appt.service
          };
        });

        // 4. Сортируем
        apptsWithService.sort((a, b) => {
          const dateCmp = a.appointment_date.localeCompare(b.appointment_date);
          if (dateCmp !== 0) return sortAsc ? dateCmp : -dateCmp;
          const timeCmp = a.appointment_time.localeCompare(b.appointment_time);
          return sortAsc ? timeCmp : -timeCmp;
        });

        // 5. Фильтруем по статусу
        const filtered = apptsWithService.filter(appt =>
          statusFilter.includes(appt.status)
        );

        setAppointments(filtered);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, statusFilter, sortAsc, accessToken]);

  const computeStatus = appt => {
    if (['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']
        .includes(appt.status)) {
      return appt.status;
    }
    // fallback, если нужен пересчет времён
    const now = new Date();
    const dt = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
    const end = new Date(dt.getTime() + (appt.duration || 15) * 60000);
    if (now >= dt && now < end) return 'in_progress';
    if (now >= end) return 'completed';
    return 'scheduled';
  };

  const onRowClick = async appt => {
    try {
      const date = new Date(appt.appointment_date);
      let weekday = date.getDay(); weekday = weekday === 0 ? 7 : weekday;
      const schedRes = await authFetch(
        `http://localhost:8000/api/clinic-schedules/?doctor=${appt.doctor}&weekday=${weekday}`
      );
      const schedData = schedRes.ok ? await schedRes.json() : [];
      setSelected({
        ...appt,
        cabinet: schedData[0]?.cabinet || '—'
      });
      setConfirmCancel(false);
    } catch {
      setSelected({
        ...appt,
        cabinet: '—'
      });
      setConfirmCancel(false);
    }
  };

  const cancelAppointment = async () => {
    if (!selected) return;
    try {
      const res = await authFetch(
        `http://localhost:8000/api/appointments/${selected.id}/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );
      if (!res.ok) throw new Error('Ошибка отмены');
      const updated = await res.json();
      setAppointments(appts =>
        appts.map(a => (a.id === updated.id ? updated : a))
      );
      setSelected(prev => ({ ...prev, status: 'cancelled' }));
      setConfirmCancel(false);
    } catch (err) {
      alert(err.message || 'Не удалось отменить приём');
    }
  };

  if (loading) return <p>Загрузка записей...</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;

  return (
    <div className="my-appointments">
      <h2>Мои записи</h2>
      {appointments.length === 0 ? (
        <p>Записей пока нет</p>
      ) : (
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
            {appointments.map(appt => (
              <tr
                key={appt.id}
                onClick={() => onRowClick(appt)}
                className={selected?.id === appt.id ? 'selected' : ''}
              >
                <td>{appt.appointment_date}</td>
                <td>{appt.appointment_time.slice(0, 5)}</td>
                <td>{appt.doctor_name}</td>
                <td>{appt.service_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="appointment-details">
          <h3>
            Запись на {selected.appointment_date} в{' '}
            {selected.appointment_time.slice(0, 5)}
          </h3>
          <p><strong>Врач:</strong> {selected.doctor_name}</p>
          <p><strong>Кабинет:</strong> {selected.cabinet}</p>
          <p><strong>Услуга:</strong> {selected.service_name}</p>
          <p><strong>Причина:</strong> {selected.reason}</p>
          <p><strong>Статус:</strong> {computeStatus(selected)}</p>

          {selected.status === 'scheduled' && (
            <div className="actions">
              {!confirmCancel ? (
                <button onClick={() => setConfirmCancel(true)}>Отменить приём</button>
              ) : (
                <div className="confirm-box">
                  <p>Вы уверены?</p>
                  <button onClick={cancelAppointment}>Да</button>
                  <button onClick={() => setConfirmCancel(false)}>Нет</button>
                </div>
              )}
            </div>
          )}

          {['in_progress', 'completed'].includes(selected.status) && (
            <div className="documents-section">
              <h4>Документы:</h4>
              <PatientDocumentList
                documents={selected.documents}
                onDelete={null} // запрет удаления в истории
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
