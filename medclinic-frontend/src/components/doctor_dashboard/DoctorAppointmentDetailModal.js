import React, { useState, useEffect } from 'react';
import { authFetch } from '../../api';
import '../../styles/DoctorAppointments.css';

export default function DoctorAppointmentDetailModal({
  initialData,
  services,
  onClose
}) {
  const [details, setDetails] = useState(initialData);

  useEffect(() => {
    // only refetch if not just "scheduled"
    if (initialData.status !== 'scheduled') {
      authFetch(`/api/appointments/${initialData.id}/`)
        .then(r => {
          if (!r.ok) throw new Error('Не удалось загрузить детали');
          return r.json();
        })
       .then(d => {
          setDetails({
            ...d,
            cabinet: initialData.cabinet  // preserve cabinet
          });
        })
        .catch(console.error);
    }
  }, [initialData]);

  const svc = services.find(s => s.id === details.service);
  const showGo = ['in_progress','completed','no_show'].includes(details.status);
  const isDone = details.status === 'completed';

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{details.appointment_date} в {details.appointment_time.slice(0,5)}</h3>
        <p><strong>Кабинет:</strong> {details.cabinet}</p>
        <p><strong>Пациент:</strong> {details.patient_name}</p>
        <p><strong>Услуга:</strong> {svc?.name || details.service}</p>
        <p><strong>Причина:</strong> {details.reason}</p>
        <p><strong>Статус:</strong> {details.status}</p>

        {isDone && (
          <>
            <div className="form-group">
              <label>Диагноз:</label>
              <textarea readOnly value={details.diagnosis||''} />
            </div>
            <div className="form-group">
              <label>Рекомендации:</label>
              <textarea readOnly value={details.recommendations||''} />
            </div>
            <div className="form-group">
              <label>Документы:</label>
              {details.documents.length
                ? details.documents.map(doc => (
                    <div key={doc.id}><a href={doc.url}>{doc.name}</a></div>
                  ))
                : <p>Нет</p>
              }
            </div>
          </>
        )}

        {showGo && (
          <button
            className="modal-confirm"
            onClick={() => window.location.href = `/appointments/${details.id}`}
          >
            Перейти к записи
          </button>
        )}
      </div>
    </div>
  );
}
