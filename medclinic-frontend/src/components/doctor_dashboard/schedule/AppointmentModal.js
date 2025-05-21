import React from 'react';
import '../../styles/DoctorSchedule.css';

export default function AppointmentModal({ info, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Приём {info.date.toLocaleDateString()} в {info.time}</h3>
        <p><strong>Кабинет:</strong> {info.cabinet}</p>
        {/* <p><strong>Пациент:</strong> {info.patient.name}</p> */}
        {/* и т.д. */}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
