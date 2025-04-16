import React, { useState, useEffect } from 'react';
import './PatientDashboard.css'; // Подключим стили

import PatientDocumentList from './PatientDocumentList';
import DocumentUpload from './DocumentUpload';
import { getPatientDocuments } from '../api';

const PatientDashboard = ({ patientId }) => {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  useEffect(() => {
    if (selectedSection === 'documents') {
      getPatientDocuments(patientId).then(setDocuments);
    }
  }, [selectedSection, patientId]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Личный кабинет</h1>
      </header>

      <div className="sidebar">
        <ul>
          <li onClick={() => handleSectionClick('personalInfo')}>Личная информация</li>
          <li onClick={() => handleSectionClick('appointments')}>Запись к врачу</li>
          <li onClick={() => handleSectionClick('myRecords')}>Мои записи</li>
          <li onClick={() => handleSectionClick('documents')}>Мои документы</li>
          <li onClick={() => handleSectionClick('history')}>История</li>
          <li onClick={() => handleSectionClick('logout')}>Выйти</li>
        </ul>
      </div>

      <div className="content">
        {selectedSection === 'personalInfo' && (
          <div className="section">
            <h2>Личная информация</h2>
            <ul>
              <li>ФИО: Иванов Иван Иванович</li>
              <li>Телефон: +7 900 123 45 67</li>
              <li>Почта: ivanov@example.com</li>
              <li><button>Редактировать информацию</button></li>
              <li><button className="danger">Удалить учетную запись</button></li>
            </ul>
          </div>
        )}

        {selectedSection === 'appointments' && (
          <div className="section">
            <h2>Запись к врачу</h2>
            <p>Здесь будет форма для записи к врачу</p>
          </div>
        )}

        {selectedSection === 'myRecords' && (
          <div className="section">
            <h2>Мои записи</h2>
            <ul>
              <li>Прием 1: 20.04.2025 - Доктор: Петров Петр Петрович - Причина: осмотр - Статус: Не отменен</li>
              <li>Прием 2: 22.04.2025 - Доктор: Сидоров Сидор Сидорович - Причина: анализы - Статус: Отменен</li>
            </ul>
          </div>
        )}

        {selectedSection === 'documents' && (
          <div className="section">
            <h2>Мои документы</h2>
            <PatientDocumentList documents={documents} />
            <DocumentUpload patientId={patientId} />
          </div>
        )}

        {selectedSection === 'history' && (
          <div className="section">
            <h2>История</h2>
            <button onClick={() => setSelectedSection('visitHistory')}>История посещений</button>
            <button onClick={() => setSelectedSection('dischargeHistory')}>Выписки</button>
          </div>
        )}

        {selectedSection === 'visitHistory' && (
          <div className="section">
            <h2>История посещений</h2>
            <ul>
              <li>Прием 1: 20.04.2025 - Доктор: Петров Петр Петрович - Причина: осмотр - Заключение: Все хорошо</li>
              <li>Прием 2: 22.04.2025 - Доктор: Сидоров Сидор Сидорович - Причина: анализы - Заключение: нет</li>
            </ul>
          </div>
        )}

        {selectedSection === 'dischargeHistory' && (
          <div className="section">
            <h2>Выписки</h2>
            <ul>
              <li>Выписка 1: 20.04.2025 - Диагноз: Простуда</li>
              <li>Выписка 2: 22.04.2025 - Диагноз: Пневмония</li>
            </ul>
          </div>
        )}

        {selectedSection === 'logout' && (
          <div className="section">
            <h2>Выход</h2>
            <p>Вы действительно хотите выйти?</p>
            <button>Да</button>
            <button>Нет</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;