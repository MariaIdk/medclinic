// src/components/patient_dashboard/PatientDashboard.js
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
  const [documentsError, setDocumentsError] = useState(null);

  const [historySubsection, setHistorySubsection] = useState('appointments');
  const [historyDocs, setHistoryDocs] = useState([]);

  const [summaryDate, setSummaryDate] = useState('');
  const [summaryDirection, setSummaryDirection] = useState('all');
  const [specialties, setSpecialties] = useState([]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Загрузка "Мои документы"
  useEffect(() => {
    if (selectedSection === 'documents') {
      getPatientDocuments(patientId)
        .then(setDocuments)
        .catch(err => setDocumentsError(err.message));
    }
  }, [selectedSection, patientId]);

  // Загрузка выписок и направлений
  useEffect(() => {
    if (selectedSection === 'history' && historySubsection === 'summaries') {
      getPatientDocuments(patientId)
        .then(data => {
          const docs = data.filter(d => d.uploaded_by === 'doctor');
          setHistoryDocs(docs);
        })
        .catch(() => alert('Ошибка загрузки выписок'));

      fetch('/api/specialties/')
        .then(r => r.ok && r.json())
        .then(setSpecialties)
        .catch(() => {});
    }
  }, [selectedSection, historySubsection, patientId]);

  const filteredSummaries = historyDocs.filter(doc => {
    if (summaryDate && doc.created_at.slice(0, 10) !== summaryDate) return false;
    if (
      summaryDirection !== 'all' &&
      doc.uploaded_by_doctor?.specialty?.id !== +summaryDirection
    ) return false;
    return true;
  });

  const handleSectionClick = (section) => {
    if (section === 'home') return navigate('/');
    if (section === 'logout') return setShowLogoutConfirm(true);

    setSelectedSection(section);
    if (section !== 'history') setHistorySubsection('appointments');
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Точно удалить документ?')) return;
    try {
      await deletePatientDocument(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

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
          <li className={selectedSection === 'personalInfo' ? 'active' : ''} onClick={() => handleSectionClick('personalInfo')}>Личная информация</li>
          <li className={selectedSection === 'appointments' ? 'active' : ''} onClick={() => handleSectionClick('appointments')}>Запись к врачу</li>
          <li className={selectedSection === 'myRecords' ? 'active' : ''} onClick={() => handleSectionClick('myRecords')}>Мои записи</li>
          <li className={selectedSection === 'documents' ? 'active' : ''} onClick={() => handleSectionClick('documents')}>Мои документы</li>
          <li className={selectedSection === 'history' ? 'active' : ''} onClick={() => handleSectionClick('history')}>История</li>
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
          <section>
            <h2>Мои документы</h2>
            {documentsError && <p className="error">{documentsError}</p>}
            <PatientDocumentList documents={documents} onDelete={handleDeleteDocument} />
            <DocumentUpload
              patientId={patientId}
              onUpload={() => getPatientDocuments(patientId).then(setDocuments)}
            />
          </section>
        )}
        {selectedSection === 'history' && (
          <section>
            <h2>История</h2>
            <div className="history-buttons">
              <button className={historySubsection === 'appointments' ? 'active' : ''} onClick={() => setHistorySubsection('appointments')}>Посещения</button>
              <button className={historySubsection === 'summaries' ? 'active' : ''} onClick={() => setHistorySubsection('summaries')}>Выписки</button>
            </div>

            {historySubsection === 'appointments' && (
              <MyAppointments
                patientId={patientId}
                statusFilter={['completed', 'cancelled', 'no_show']}
                sortAsc={false}
              />
            )}

            {historySubsection === 'summaries' && (
              <>
                <div className="filters-row">
                  <label>
                    Дата:
                    <input
                      type="date"
                      value={summaryDate}
                      onChange={e => setSummaryDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Направление:
                    <select
                      value={summaryDirection}
                      onChange={e => setSummaryDirection(e.target.value)}
                    >
                      <option value="all">Все</option>
                      {specialties.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <PatientDocumentList documents={filteredSummaries} onDelete={null} />
              </>
            )}
          </section>
        )}
      </main>

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
