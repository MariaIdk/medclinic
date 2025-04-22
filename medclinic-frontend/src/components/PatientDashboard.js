// src/components/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';

import PatientDocumentList from './PatientDocumentList';
import DocumentUpload from './DocumentUpload';
// import { getPatientDocuments, deletePatientDocument } from '../api';
import { getPatientDocuments, uploadPatientDocument, deletePatientDocument } from './api';
import AppointmentForm from './AppointmentForm';
import MyAppointments from './MyAppointments';

const PatientDashboard = ({ patientId }) => {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);
  const [docFilter, setDocFilter] = useState('all');
  const [historySubsection, setHistorySubsection] = useState(null);
  const [historyDocs, setHistoryDocs] = useState([]);

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
            {/* Личная информация */}
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
            {/* <DocumentUpload patientId={patientId} /> */}

            <DocumentUpload
              patientId={patientId}
              onUpload={() => {
                // повторно запросить и обновить список
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
                statusFilter={['completed']}
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

        {selectedSection === 'logout' && (
          <div className="section">
            {/* Логика выхода, если нужна */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
