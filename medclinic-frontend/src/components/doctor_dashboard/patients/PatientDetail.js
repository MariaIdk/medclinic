// src/components/doctor_dashboard/patients/PatientDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { authFetch } from '../../../api';
import PatientDocumentList from '../../patient_dashboard/documents/PatientDocumentList';
import MyAppointments from '../../patient_dashboard/appointments/MyAppointments';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/PatientDetail.css';

export default function PatientDetail() {
  const { accessToken } = useContext(AuthContext);
  const { patientId }   = useParams();
  const navigate        = useNavigate();

  // patient info
  const [patient, setPatient] = useState(null);

  // tabs
  const [activeTab, setActiveTab] = useState('appointments');

  // documents tab state
  const [docs, setDocs]                   = useState([]);
  const [specialties, setSpecialties]     = useState([]);
  const [dateFilter, setDateFilter]       = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');

  // load patient
  useEffect(() => {
    if (!accessToken) return;
    authFetch(`/api/patients/${patientId}/`)
      .then(r => r.ok && r.json())
      .then(setPatient)
      .catch(console.error);
  }, [patientId, accessToken]);

  // when switching to "documents" tab, load docs & specialties
  useEffect(() => {
    if (activeTab !== 'documents' || !accessToken) return;
    // load patient documents
    authFetch(`/api/patient-documents/?patient=${patientId}`)
      .then(r => r.ok && r.json())
      .then(setDocs)
      .catch(console.error);
    // load specialties for doctor uploader filter
    authFetch('/api/specialties/')
      .then(r => r.ok && r.json())
      .then(setSpecialties)
      .catch(console.error);
  }, [activeTab, patientId, accessToken]);

  if (!patient) {
    return <div className="d-flex justify-content-center p-5">Загрузка данных пациента...</div>;
  }

  // filter documents
  const filteredDocs = docs.filter(doc => {
    // date filter
    if (dateFilter && doc.created_at.slice(0,10) !== dateFilter) {
      return false;
    }
    // uploader filter
    if (uploaderFilter !== 'all' && doc.uploaded_by !== uploaderFilter) {
      return false;
    }
    // direction filter only when uploader is doctor
    if (uploaderFilter === 'doctor' && directionFilter !== 'all') {
      const specId = doc.uploaded_by_doctor?.specialty?.id;
      if (specId !== +directionFilter) return false;
    }
    return true;
  });

  return (
    <div className="container patient-detail p-4">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">{patient.first_name} {patient.last_name}</h4>
          <p className="card-text"><strong>Дата рождения:</strong> {patient.date_of_birth}</p>
          <p className="card-text"><strong>Email:</strong> {patient.email}</p>
          <p className="card-text"><strong>Телефон:</strong> {patient.phone_number}</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Посещения
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Документы пациента
          </button>
        </li>
      </ul>

      {activeTab === 'appointments' ? (
        <MyAppointments
          patientId={patientId}
          statusFilter={['scheduled','in_progress','completed','no_show']}
          sortAsc={false}
          showDocsWithActions={false}
        />
      ) : (
        <div className="document-section">
          <h5 className="mb-3">Фильтры</h5>
          <div className="d-flex flex-wrap mb-3">
            <div className="me-3 mb-2">
              <label className="form-label">Дата загрузки:</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
            <div className="me-3 mb-2">
              <label className="form-label">Кем загружено:</label>
              <select
                className="form-select"
                value={uploaderFilter}
                onChange={e => {
                  setUploaderFilter(e.target.value);
                  setDirectionFilter('all');
                }}
              >
                <option value="all">Все</option>
                <option value="patient">Пациентом</option>
                <option value="doctor">Врачом</option>
              </select>
            </div>
            {uploaderFilter === 'doctor' && (
              <div className="me-3 mb-2">
                <label className="form-label">Направление:</label>
                <select
                  className="form-select"
                  value={directionFilter}
                  onChange={e => setDirectionFilter(e.target.value)}
                >
                  <option value="all">Все</option>
                  {specialties.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredDocs.length > 0 ? (
            <PatientDocumentList documents={filteredDocs} onDelete={null} />
          ) : (
            <p>Документы не найдены.</p>
          )}
        </div>
      )}
    </div>
  );
}
