import React, { useState, useEffect, useContext } from 'react'; 
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import DoctorAppointmentDetailModal from './DoctorAppointmentDetailModal';
import '../../styles/DoctorAppointments.css';

export default function DoctorAppointments({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [filters, setFilters] = useState({ date: '', patientId: null, status: 'all' });
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [modalAppt, setModalAppt] = useState(null);

  useEffect(() => {
    authFetch('/api/patients/')
      .then(r => r.ok && r.json())
      .then(setPatients)
      .catch(console.error);
    authFetch('/api/services/')
      .then(r => r.ok && r.json())
      .then(setServices)
      .catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    let url = `/api/appointments/?doctor=${doctorId}&status=all&ordering=appointment_date`;
    if (filters.date)    url += `&appointment_date=${filters.date}`;
    if (filters.patientId) url += `&patient=${filters.patientId}`;
    authFetch(url)
      .then(r => r.ok && r.json())
      .then(data => {
        // отфильтруем отменённые
        data = data.filter(a => a.status !== 'cancelled');
        if (filters.status !== 'all') {
          data = data.filter(a => a.status === filters.status);
        }
        // подставим название услуги
        data = data.map(a => ({
          ...a,
          service_name: services.find(s => s.id === a.service)?.name || a.service
        }));
        setAppointments(data);
      })
      .catch(console.error);
  }, [doctorId, filters, services]);

  // открываем модалку, сразу передаем весь объект a, в том числе documents
  const openModal = appt => {
    // подтягиваем кабинет отдельно
    const date = new Date(appt.appointment_date);
    const wd = date.getDay() || 7;
    authFetch(`/api/clinic-schedules/?doctor=${doctorId}&weekday=${wd}`)
      .then(r => r.ok ? r.json() : [])
      .then(sched => {
        setModalAppt({ ...appt, cabinet: sched[0]?.cabinet || '—' });
      })
      .catch(_ => setModalAppt({ ...appt, cabinet: '—' }));
  };

  return (
    <div className="doctor-appointments">
      <h2>Записи</h2>
      <div className="filters-row">
        <label>Дата:
          <input
            type="date"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          />
        </label>
        <label>Пациент:
          <input
            type="text"
            placeholder="ФИО..."
            onChange={e => {
              const q = e.target.value.toLowerCase();
              const match = patients.find(p =>
                p.patient_name.toLowerCase().includes(q)
              );
              setFilters(f => ({ ...f, patientId: match?.id || null }));
            }}
          />
        </label>
        <label>Статус:
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="all">Все</option>
            <option value="scheduled">Назначен</option>
            <option value="in_progress">Идёт</option>
            <option value="completed">Завершён</option>
            <option value="no_show">Не пришёл</option>
          </select>
        </label>
      </div>

      <table className="doctor-appointments-table">
        <thead>
          <tr>
            <th>Дата</th><th>Время</th><th>Пациент</th><th>Услуга</th><th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr><td colSpan="5">Записей не найдено</td></tr>
          )}
          {appointments.map(a => (
            <tr
              key={a.id}
              className="clickable-row"
              onClick={() => openModal(a)}
            >
              <td>{a.appointment_date}</td>
              <td>{a.appointment_time.slice(0,5)}</td>
              <td>{a.patient_name}</td>
              <td>{a.service_name}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAppt && (
        <DoctorAppointmentDetailModal
          initialData={modalAppt}
          services={services}
          onClose={() => setModalAppt(null)}
        />
      )}
    </div>
  );
}
