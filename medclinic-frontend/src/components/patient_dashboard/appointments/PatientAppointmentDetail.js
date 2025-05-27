// src/components/patient_dashboard/appointments/PatientAppointmentDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../../api';
import { AuthContext } from '../../../contexts/AuthContext';
import PatientDocumentList from '../../patient_dashboard/documents/PatientDocumentList';
import '../../../styles/AppointmentSchedule.css';

export default function PatientAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`/api/appointments/${id}/`);
        if (!res.ok) throw new Error('Не удалось загрузить приём');
        const json = await res.json();

        // получить кабинет
        const date = new Date(json.appointment_date);
        let wd = date.getDay(); if (wd === 0) wd = 7;
        const schedRes = await authFetch(
          `/api/clinic-schedules/?doctor=${json.doctor}&weekday=${wd}`
        );
        const schedData = schedRes.ok ? await schedRes.json() : [];
        json.cabinet = schedData[0]?.cabinet || '—';

        // получить имя услуги
        const svcRes = await authFetch('/api/services/');
        const svcs = svcRes.ok ? await svcRes.json() : [];
        json.service_name = (svcs.find(s => s.id === json.service)||{}).name || '';

        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) load();
  }, [id, accessToken]);

  if (loading) return <div className="schedule-wrapper">Загрузка...</div>;
  if (error)   return <div className="schedule-wrapper">Ошибка: {error}</div>;

  const computeStatus = appt => {
    // аналогично вашему
    return appt.status;
  };

  return (
    <div className="schedule-wrapper">
      <button 
        onClick={() => navigate('/dashboard', { 
          state: { 
            section: 'history', 
            subsection: 'appointments' 
          }
        })}>
        ← Назад
      </button>

      <h2>Детали приёма</h2>

      <div className="form-group">
        <label>Дата и время</label>
        <input
          value={`${data.appointment_date} ${data.appointment_time.slice(0,5)}`}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>Кабинет</label>
        <input value={data.cabinet} readOnly />
      </div>

      <div className="form-group">
        <label>Пациент</label>
        <span>{data.patient_name}</span>
      </div>

      <div className="form-group">
        <label>Врач</label>
        <span>{data.doctor_name}</span>
      </div>

      <div className="form-group">
        <label>Услуга</label>
        <input value={data.service_name} readOnly/>
      </div>

      <div className="form-group">
        <label>Причина обращения</label>
        <textarea value={data.reason} readOnly/>
      </div>

      <div className="form-group">
        <label>Статус</label>
        <input value={computeStatus(data)} readOnly/>
      </div>

      {data.status === 'completed' && (
        <>
          <div className="form-group">
            <label>Диагноз</label>
            <textarea value={data.diagnosis || ''} readOnly/>
          </div>
          <div className="form-group">
            <label>Рекомендации</label>
            <textarea value={data.recommendations || ''} readOnly/>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Документы</label>
        {data.documents && data.documents.length > 0 ? (
          <PatientDocumentList
            documents={data.documents}
            onDelete={null}  // запрет удаления
          />
        ) : (
          <p>Нет документов</p>
        )}
      </div>
    </div>
  );
}
