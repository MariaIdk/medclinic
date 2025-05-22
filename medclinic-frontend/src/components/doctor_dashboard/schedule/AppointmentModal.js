// src/components/doctor_dashboard/AppointmentModal.js
import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../api';
import '../../../styles/DoctorAppointmentModal.css';

export default function DoctorAppointmentModal({
  slotData,
  services,
  onClose
}) {
  const [patients, setPatients] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    service: '',
    reason: ''
  });

  const filteredServices = services.filter(
    (s) => s.direction === slotData.direction
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        if (slotData.appointment) {
          const res = await authFetch(
            `/api/appointments/${slotData.appointment.id}/`
          );
          const data = await res.json();
          setAppointmentDetails(data);
        } else {
          const patientsRes = await authFetch('/api/patients/');
          setPatients(await patientsRes.json());
          // auto-select first service
          if (filteredServices.length) {
            setFormData((prev) => ({
              ...prev,
              service: filteredServices[0].id.toString()
            }));
          }
        }
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      }
    };
    loadData();
  }, [slotData]);

  // Lookup service name for existing appointment
  const getServiceName = () => {
    if (!appointmentDetails) return '';
    const svc = services.find((s) => s.id === appointmentDetails.service);
    return svc ? svc.name : appointmentDetails.service;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doctor: slotData.doctorId,
          appointment_date: slotData.date,
          appointment_time: slotData.time
        })
      });

      if (!res.ok) throw new Error('Ошибка сохранения');
      onClose();
      window.location.reload();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>
          {slotData.date} {slotData.time}
        </h3>
        <p>Кабинет: {slotData.cabinet}</p>

        {slotData.isBooked ? (
          appointmentDetails ? (
            <div className="existing-appointment">
              <div className="form-group">
                <label>Пациент:</label>
                <a
                  href={`/patients/${appointmentDetails.patient}`}
                  className="patient-link"
                >
                  {appointmentDetails.patient_name}
                </a>
              </div>

              <div className="form-group">
                <label>Услуга:</label>
                <input value={getServiceName()} readOnly />
              </div>

              <div className="form-group">
                <label>Причина:</label>
                <textarea value={appointmentDetails.reason} readOnly />
              </div>

              <div className="form-group">
                <label>Статус:</label>
                <select value={appointmentDetails.status} disabled>
                  <option value="scheduled">Назначен</option>
                  <option value="in_progress">Идёт</option>
                  <option value="completed">Завершён</option>
                  <option value="cancelled">Отменён</option>
                </select>
              </div>

              {appointmentDetails.status === 'completed' && (
                <button
                  className="btn-go-record"
                  onClick={() =>
                    (window.location.href = `/appointments/${appointmentDetails.id}`)
                  }
                >
                  Перейти к записи
                </button>
              )}
            </div>
          ) : (
            <p>Загрузка данных...</p>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Пациент:</label>
              <select
                required
                value={formData.patient}
                onChange={(e) =>
                  setFormData({ ...formData, patient: e.target.value })
                }
              >
                <option value="">Выберите пациента</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.last_name} {p.first_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Услуга:</label>
              <select
                required
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
              >
                <option value="">Выберите услугу</option>
                {filteredServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Причина обращения:</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <button type="submit" className="btn-save">
              Сохранить запись
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
