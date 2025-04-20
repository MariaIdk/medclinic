// src/components/MyAppointments.js
import React, { useState, useEffect } from 'react';
import './MyAppointments.css';

export default function MyAppointments({ patientId, statusFilter, sortAsc = false }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем справочник услуг
        const servicesRes = await fetch('http://localhost:8000/api/services/');
        const servicesData = await servicesRes.json();
        setServices(servicesData);

        // Загружаем записи пациента
        const apptRes = await fetch(`http://localhost:8000/api/appointments/?patient=${patientId}&ordering=appointment_date`);
        const appts = await apptRes.json();

        // Подставляем название услуги
        const apptsWithServiceName = appts.map(appt => {
          const matchedService = servicesData.find(s => s.id === appt.service);
          return {
            ...appt,
            service_name: matchedService ? matchedService.name : appt.service
          };
        });

        
        // Сортировка: по дате и времени
        apptsWithServiceName.sort((a, b) => {
            const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
            if (dateCompare !== 0) return sortAsc ? dateCompare : -dateCompare;
            const timeCompare = a.appointment_time.localeCompare(b.appointment_time);
            return sortAsc ? timeCompare : -timeCompare;
        });
  

        // Фильтрация по статусам
        const filteredAppointments = apptsWithServiceName.filter(appt =>
          statusFilter.includes(computeStatus(appt))
        );

        setAppointments(filteredAppointments);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Ошибка загрузки записей');
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, statusFilter]);

  const onRowClick = appt => {
    const date = new Date(appt.appointment_date);
    let weekday = date.getDay();
    weekday = weekday === 0 ? 7 : weekday;

    fetch(`http://localhost:8000/api/clinic-schedules/?doctor=${appt.doctor}&weekday=${weekday}`)
      .then(res => res.json())
      .then(data => {
        const cabinet = (data[0] && data[0].cabinet) || '—';
        setSelected({ ...appt, cabinet });
        setConfirmCancel(false);
      })
      .catch(() => setSelected({ ...appt, cabinet: '—' }));
  };

  const computeStatus = appt => {
    if (appt.status !== 'scheduled') return appt.status;
    const now = new Date();
    const dt = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
    const duration = appt.duration || 15;
    const end = new Date(dt.getTime() + duration * 60000);
    if (now >= dt && now < end) return 'in_progress';
    if (now >= end) return 'completed';
    return 'scheduled';
  };

  const cancelAppointment = () => {
    fetch(`http://localhost:8000/api/appointments/${selected.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(updated => {
        setAppointments(appts => appts.map(a => a.id === updated.id ? updated : a));
        setSelected({ ...selected, status: 'cancelled' });
        setConfirmCancel(false);
      })
      .catch(() => alert('Не удалось отменить приём'));
  };

  if (loading) return <p>Загрузка записей...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="my-appointments">
      <h2>Мои записи</h2>
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
              <td>{appt.service_name || appt.service}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="appointment-details">
          <h3>Запись на {selected.appointment_date} в {selected.appointment_time.slice(0, 5)}</h3>
          <p><strong>Врач:</strong> {selected.doctor_name}</p>
          <p><strong>Кабинет:</strong> {selected.cabinet}</p>
          <p><strong>Услуга:</strong> {selected.service_name || selected.service}</p>
          <p><strong>Причина:</strong> {selected.reason}</p>
          <p><strong>Статус:</strong> {computeStatus(selected)}</p>

          {computeStatus(selected) === 'scheduled' && (
            <div className="actions">
              {!confirmCancel && <button onClick={() => setConfirmCancel(true)}>Отменить приём</button>}
              {confirmCancel && (
                <div className="confirm-box">
                  <p>Вы уверены?</p>
                  <button onClick={cancelAppointment}>Да</button>
                  <button onClick={() => setConfirmCancel(false)}>Нет</button>
                </div>
              )}
            </div>
          )}

          {['in_progress', 'completed'].includes(computeStatus(selected)) && (
            <>
              <p><strong>Диагноз:</strong> {selected.diagnosis || '—'}</p>
              <p><strong>Рекомендации:</strong> {selected.recommendations || '—'}</p>
              <div><strong>Документы:</strong>
                <ul>
                  {selected.documents?.length ? selected.documents.map(doc => (
                    <li key={doc.id}>
                      <a href={`http://localhost:8000${doc.document_file}`} target="_blank" rel="noopener noreferrer">
                        {doc.description}
                      </a>
                    </li>
                  )) : <li>—</li>}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
