// src/components/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';

import PatientDocumentList from './PatientDocumentList';
import DocumentUpload from './DocumentUpload';
import { getPatientDocuments, uploadPatientDocument, deletePatientDocument } from './api';
import AppointmentForm from './AppointmentForm';
import MyAppointments from './MyAppointments';
import PersonalInfo from './PersonalInfo';

const PatientDashboard = ({ patientId }) => {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);
  const [docFilter, setDocFilter] = useState('all');
  const [historySubsection, setHistorySubsection] = useState(null);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    if (section === 'logout') {
      setShowLogoutConfirm(true);
    } else {
      setSelectedSection(section);
      if (section !== 'history') {
        setHistorySubsection(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
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
        setDocuments(data);
      });
    }
  }, [selectedSection, patientId]);

  useEffect(() => {
    if (selectedSection === 'history' && historySubsection === 'summaries') {
      getPatientDocuments(patientId).then((data) => {
        setHistoryDocs(data.filter(doc => doc.uploaded_by === 'doctor'));
      });
    }
  }, [selectedSection, historySubsection, patientId]);

  const filteredDocuments = documents.filter(doc => {
    if (docFilter === 'all') return true;
    return doc.uploaded_by === docFilter;
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="back-to-home" onClick={() => navigate('/')}>
          ← Вернуться на главную страницу
        </div>
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
            <PersonalInfo patientId={patientId} />
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

            <div className="document-filter">
              <label>Показать: </label>
              <select
                value={docFilter}
                onChange={e => setDocFilter(e.target.value)}
              >
                <option value="all">Все</option>
                <option value="patient">Добавленные мной</option>
                <option value="doctor">Добавленные врачом</option>
              </select>
            </div>

            <PatientDocumentList
              documents={filteredDocuments}
              onDelete={handleDelete}
            />

            <DocumentUpload
              patientId={patientId}
              onUpload={() => {
                getPatientDocuments(patientId).then(setDocuments);
              }}
            />
          </div>
        )}

        {selectedSection === 'history' && (
          <div className="section">
            <h2>История</h2>
            <div className="history-buttons">
              <button onClick={() => setHistorySubsection('appointments')}>История посещений</button>
              <button onClick={() => setHistorySubsection('summaries')}>Выписки</button>
            </div>

            {historySubsection === 'appointments' && (
              <MyAppointments
                patientId={patientId}
                statusFilter={['completed', 'cancelled', 'no_show']}
                sortAsc={false}
                showDocsWithActions={true}
              />
            )}

            {historySubsection === 'summaries' && (
              <div>
                <h3>Документы, добавленные врачом</h3>
                <PatientDocumentList
                  documents={historyDocs}
                  onDelete={null}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения выхода */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <p>Выйти из личного кабинета?</p>
            <div className="logout-buttons">
              <button onClick={handleLogout}>Да</button>
              <button onClick={() => setShowLogoutConfirm(false)}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
