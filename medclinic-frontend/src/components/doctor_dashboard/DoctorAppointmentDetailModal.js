import React from 'react';
import '../../styles/DoctorAppointments.css';

export default function DoctorAppointmentDetailModal({
  initialData,
  services,
  onClose
}) {
  const details = initialData;
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
              <textarea readOnly value={details.diagnosis || ''} />
            </div>
            <div className="form-group">
              <label>Рекомендации:</label>
              <textarea readOnly value={details.recommendations || ''} />
            </div>
            <div className="form-group">
              <label>Документы:</label>
              {details.documents && details.documents.length > 0 ? (
                details.documents.map(doc => (
                  <div key={doc.id}>
                    <a href={doc.document_file} target="_blank" rel="noopener noreferrer">
                      {doc.description}
                    </a>
                  </div>
                ))
              ) : (
                <p>Нет</p>
              )}
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
