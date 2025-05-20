// PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import { getPatientDocuments, deletePatientDocument } from '../../api';
import AppointmentForm from './appointments/AppointmentForm';
import MyAppointments from './appointments/MyAppointments';
import PersonalInfo from './PersonalInfo';
import DocumentUpload from './documents/DocumentUpload';
import PatientDocumentList from './documents/PatientDocumentList';

export default function PatientDashboard({ patientId }) {
  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [documents, setDocuments] = useState([]);
  const [docFilter, setDocFilter] = useState('all');
  const [documentsError, setDocumentsError] = useState(null);
  const [historySubsection, setHistorySubsection] = useState(null);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  // Меню
  const handleSectionClick = (section) => {
    if (section === 'home') return navigate('/');
    if (section === 'logout') return setShowLogoutConfirm(true);

    setSelectedSection(section);
    if (section !== 'history') setHistorySubsection(null);
  };

  // Мои документы
  // useEffect(() => {
  //   if (selectedSection === 'documents') {
  //     getPatientDocuments(patientId).then(setDocuments).catch(() => {
  //       alert('Ошибка загрузки документов');
  //     });
  //   }
  // }, [selectedSection, patientId]);

  useEffect(() => {
    const loadDocuments = async () => {
      if (selectedSection === 'documents' && patientId) {
        try {
          setDocumentsError(null);
          const data = await getPatientDocuments(patientId);
          setDocuments(data);
        } catch (error) {
          setDocumentsError(error.message);
          console.error('Document load error:', error);
        }
      }
    };

    loadDocuments();
  }, [selectedSection, patientId]);

  // История → выписки
  useEffect(() => {
    if (selectedSection === 'history' && historySubsection === 'summaries') {
      getPatientDocuments(patientId)
        .then(data => setHistoryDocs(data.filter(d => d.uploaded_by === 'doctor')))
        .catch(() => alert('Ошибка загрузки выписок'));
    }
  }, [selectedSection, historySubsection, patientId]);

  const filteredDocuments = documents.filter(d => 
    docFilter === 'all' ? true : d.uploaded_by === docFilter
  );

  // Удалить документ
  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Точно удалить документ?')) return;
    try {
      await deletePatientDocument(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  // После загрузки нового
  const handleUploadDone = () => {
    getPatientDocuments(patientId).then(setDocuments);
  };

  // Подтвердить/отменить выход
  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };
  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <ul>
          <li onClick={() => handleSectionClick('home')}>← Главная</li>
          <li 
            className={selectedSection==='personalInfo'?'active':''}
            onClick={() => handleSectionClick('personalInfo')}
          >
            Личная информация
          </li>
          <li 
            className={selectedSection==='appointments'?'active':''}
            onClick={() => handleSectionClick('appointments')}
          >
            Запись к врачу
          </li>
          <li 
            className={selectedSection==='myRecords'?'active':''}
            onClick={() => handleSectionClick('myRecords')}
          >
            Мои записи
          </li>
          <li 
            className={selectedSection==='documents'?'active':''}
            onClick={() => handleSectionClick('documents')}
          >
            Мои документы
          </li>
          <li 
            className={selectedSection==='history'?'active':''}
            onClick={() => handleSectionClick('history')}
          >
            История
          </li>
          <li onClick={() => handleSectionClick('logout')}>Выйти</li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {/* Личная информация */}
        {selectedSection === 'personalInfo' && (
          <PersonalInfo patientId={patientId} />
        )}

        {/* Запись к врачу */}
        {selectedSection === 'appointments' && (
          <AppointmentForm patientId={patientId} />
        )}

        {/* Мои записи */}
        {selectedSection === 'myRecords' && (
          <MyAppointments
            patientId={patientId}
            statusFilter={['scheduled','in_progress']}
            sortAsc={true}
          />
        )}

        {/* Мои документы */}
        {selectedSection === 'documents' && (
          <section className="section-documents">
            <h2>Мои документы</h2>

            {documentsError && (
              <div className="alert alert-danger">
                Ошибка: {documentsError}
              </div>
            )}

            <div className="filter-row">
              <label>Показать:</label>
              <select
                value={docFilter}
                onChange={e => setDocFilter(e.target.value)}
              >
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

        {/* История */}
        {selectedSection === 'history' && (
          <section className="section-history">
            <h2>История</h2>
            <div className="history-buttons">
              <button
                className={historySubsection==='appointments'?'active':''}
                onClick={() => setHistorySubsection('appointments')}
              >
                Посещения
              </button>
              <button
                className={historySubsection==='summaries'?'active':''}
                onClick={() => setHistorySubsection('summaries')}
              >
                Выписки
              </button>
            </div>

            {historySubsection==='appointments' && (
              <MyAppointments
                patientId={patientId}
                statusFilter={['completed','cancelled','no_show']}
                sortAsc={false}
                showDocsWithActions={true}
              />
            )}
            {historySubsection==='summaries' && (
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

      {/* Модалка подтверждения выхода */}
      {showLogoutConfirm && (
        <div className="logout-modal-backdrop">
          <div className="logout-modal">
            <p>Выйти из кабинета?</p>
            <button onClick={confirmLogout}>Да</button>
            <button onClick={cancelLogout}>Нет</button>
          </div>
        </div>
      )}
    </div>
);
}


