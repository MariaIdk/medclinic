import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';

import PatientDocumentList from './PatientDocumentList';
import DocumentUpload from './DocumentUpload';
import { getPatientDocuments, uploadPatientDocument, deletePatientDocument } from '../api';
import AppointmentForm from './AppointmentForm';
import MyAppointments from './MyAppointments';

const PatientDashboard = ({ patientId }) => {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);
  const [historySubsection, setHistorySubsection] = useState(null);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    if (section !== 'history') {
      setHistorySubsection(null);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Точно удалить документ?')) {
      try {
        await deletePatientDocument(docId);
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
      } catch (error) {
        alert('Не удалось удалить документ.');
      }
    }
  };

  useEffect(() => {
    if (selectedSection === 'documents') {
      getPatientDocuments(patientId).then((data) => {
        console.log("Документы от API:", data);
        setDocuments(data);
      });
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
          <AppointmentForm patientId={patientId} />
        )}

        {selectedSection === 'myRecords' && (
          <MyAppointments
            patientId={patientId}
            statusFilter={['scheduled', 'in_progress']}
            sortAsc={true}
          />
        )}

        {selectedSection === 'documents' && (
          <div className="section">
            <h2>Мои документы</h2>
            <PatientDocumentList documents={documents} onDelete={handleDelete} />
            <DocumentUpload patientId={patientId} />
          </div>
        )}

        {selectedSection === 'history' && (
          <div className="section">
            <h2>История</h2>
            <button onClick={() => setHistorySubsection('visitHistory')}>История посещений</button>
            <button onClick={() => setHistorySubsection('dischargeHistory')}>Выписки</button>

            {historySubsection === 'visitHistory' && (
              <MyAppointments
                patientId={patientId}
                statusFilter={['completed', 'cancelled', 'no_show']}
              />
            )}

            {historySubsection === 'dischargeHistory' && (
              <div className="section">
                <h3>Выписки</h3>
                <ul>
                  <li>Выписка 1: 20.04.2025 - Диагноз: Простуда</li>
                  <li>Выписка 2: 22.04.2025 - Диагноз: Пневмония</li>
                </ul>
              </div>
            )}
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