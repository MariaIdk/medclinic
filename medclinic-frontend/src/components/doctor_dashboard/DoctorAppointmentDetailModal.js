// src/components/doctor_dashboard/DoctorAppointmentDetailModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DoctorAppointments.css';

// Убираем возможное окончание `/api` из базового URL
const rawApiUrl = process.env.REACT_APP_API_URL || '';
const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

export default function DoctorAppointmentDetailModal({
  initialData,
  services,
  onClose
}) {
  const navigate = useNavigate();
  const details = initialData;
  const svc = services.find(s => s.id === details.service);

  const showGo = ['in_progress', 'completed', 'no_show'].includes(details.status);
  const isDone = details.status === 'completed';

  // Функция для корректного открытия документа в новой вкладке
  const handleOpen = (doc) => {
    let url = doc.document_file;
    // Если путь относительный, добавляем базовый API_URL
    if (!/^https?:\/\//i.test(url)) {
      url = `${API_URL}${url}`;
    }
    console.log('Opening document URL:', url);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        {/* Кнопка закрытия */}
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Заголовок с датой и временем */}
        <h3>
          {details.appointment_date} в {details.appointment_time.slice(0,5)}
        </h3>

        {/* Основные поля */}
        <p><strong>Кабинет:</strong> {details.cabinet}</p>
        <p><strong>Пациент:</strong> {details.patient_name}</p>
        <p><strong>Услуга:</strong> {svc?.name || '—'}</p>
        <p><strong>Причина:</strong> {details.reason}</p>
        <p><strong>Статус:</strong> {details.status}</p>

        {/* Поля диагноз, рекомендации и документы только если приём завершён */}
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
                  <div key={doc.id} style={{ marginBottom: '0.5rem' }}>
                    {/* Открытие документа */}
                    <button
                      className="link-button"
                      onClick={() => handleOpen(doc)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        color: '#007bff',
                        cursor: 'pointer'
                      }}
                    >
                      {doc.description}
                    </button>
                  </div>
                ))
              ) : (
                <p>Нет документов</p>
              )}
            </div>
          </>
        )}

        {/* Кнопка перехода к редактированию приёма */}
        {showGo && (
          <button
            className="modal-confirm"
            onClick={() => navigate(`/doctor/appointments/${details.id}/edit`)}
          >
            Перейти к записи
          </button>
        )}
      </div>
    </div>
  );
}
