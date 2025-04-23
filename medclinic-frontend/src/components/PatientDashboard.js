// src/components/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';
import { getPatientDocuments, deletePatientDocument } from './api'; // Исправлен путь
import AppointmentForm from './AppointmentForm';
import MyAppointments from './MyAppointments';
import PersonalInfo from './PersonalInfo';
import DocumentUpload from './DocumentUpload';
import PatientDocumentList from './PatientDocumentList';

export default function PatientDashboard({ patientId }) {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);
  const [docFilter, setDocFilter] = useState('all');
  const [historySubsection, setHistorySubsection] = useState(null);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    if (section === 'home') {
      navigate('/');
      return;
    }
    if (section === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }
    setSelectedSection(section);
    setHistorySubsection(section === 'history' ? 'appointments' : null);
  };

  // Загрузка документов
  useEffect(() => {
    if (selectedSection === 'documents' || selectedSection === 'history') {
      getPatientDocuments(patientId)
        .then(data => {
          setDocuments(data);
          // Автоматическая загрузка выписок при переходе в историю
          if (selectedSection === 'history') {
            setHistoryDocs(data.filter(d => d.uploaded_by === 'doctor'));
          }
        })
        .catch(() => alert('Ошибка загрузки документов'));
    }
  }, [selectedSection, patientId]);

  // Обработка истории
  useEffect(() => {
    if (selectedSection === 'history' && historySubsection === 'summaries') {
      getPatientDocuments(patientId)
        .then(data => setHistoryDocs(data.filter(d => d.uploaded_by === 'doctor')))
        .catch(() => alert('Ошибка загрузки выписок'));
    }
  }, [historySubsection, patientId]);

  const filteredDocuments = documents.filter(d => 
    docFilter === 'all' ? true : d.uploaded_by === docFilter
  );

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Точно удалить документ?')) return;
    try {
      await deletePatientDocument(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
      setHistoryDocs(docs => docs.filter(d => d.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  const handleUploadDone = () => {
    getPatientDocuments(patientId)
      .then(data => {
        setDocuments(data);
        setHistoryDocs(data.filter(d => d.uploaded_by === 'doctor'));
      });
  };

  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <ul>
          <li onClick={() => handleSectionClick('home')}>← Главная</li>
          <li className={selectedSection === 'personalInfo' ? 'active' : ''}
              onClick={() => handleSectionClick('personalInfo')}>
            Личная информация
          </li>
          <li className={selectedSection === 'appointments' ? 'active' : ''}
              onClick={() => handleSectionClick('appointments')}>
            Запись к врачу
          </li>
          <li className={selectedSection === 'myRecords' ? 'active' : ''}
              onClick={() => handleSectionClick('myRecords')}>
            Мои записи
          </li>
          <li className={selectedSection === 'documents' ? 'active' : ''}
              onClick={() => handleSectionClick('documents')}>
            Мои документы
          </li>
          <li className={selectedSection === 'history' ? 'active' : ''}
              onClick={() => handleSectionClick('history')}>
            История
          </li>
          <li onClick={() => handleSectionClick('logout')}>Выйти</li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {selectedSection === 'personalInfo' && <PersonalInfo patientId={patientId} />}
        
        {selectedSection === 'appointments' && <AppointmentForm patientId={patientId} />}
        
        {selectedSection === 'myRecords' && (
          <MyAppointments
            patientId={patientId}
            statusFilter={['scheduled', 'in_progress']}
            sortAsc={true}
          />
        )}

        {selectedSection === 'documents' && (
          <section className="section-documents">
            <h2>Мои документы</h2>
            <div className="filter-row">
              <label>Показать:</label>
              <select value={docFilter} onChange={e => setDocFilter(e.target.value)}>
                <option value="all">Все</option>
                <option value="patient">Пациентом</option>
                <option value="doctor">Врачом</option>
              </select>
            </div>
            <PatientDocumentList 
              documents={filteredDocuments} 
              onDelete={handleDeleteDocument} 
            />
            <DocumentUpload 
              patientId={patientId} 
              onUpload={handleUploadDone} 
            />
          </section>
        )}

        {selectedSection === 'history' && (
          <section className="section-history">
            <h2>История</h2>
            <div className="history-buttons">
              <button className={historySubsection === 'appointments' ? 'active' : ''}
                      onClick={() => setHistorySubsection('appointments')}>
                Посещения
              </button>
              <button className={historySubsection === 'summaries' ? 'active' : ''}
                      onClick={() => setHistorySubsection('summaries')}>
                Выписки
              </button>
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
              <>
                <h3>Выписки</h3>
                <PatientDocumentList 
                  documents={historyDocs} 
                  onDelete={null} 
                />
              </>
            )}
          </section>
        )}
      </main>

      {showLogoutConfirm && (
        <div className="logout-modal-backdrop">
          <div className="logout-modal">
            <p>Выйти из кабинета?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmLogout}>Да</button>
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}