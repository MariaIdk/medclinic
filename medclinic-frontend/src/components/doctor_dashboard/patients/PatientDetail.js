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

  const [patient, setPatient]         = useState(null);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [activeTab, setActiveTab]     = useState('appointments');

  useEffect(() => {
    async function loadPatient() {
      const res = await authFetch(`/api/patients/${patientId}/`);
      if (res.ok) setPatient(await res.json());
    }
    if (accessToken) loadPatient();
  }, [patientId, accessToken]);

  useEffect(() => {
    if (activeTab === 'documents' && accessToken) {
      authFetch(`/api/patient-documents/?patient=${patientId}`)
        .then(r => r.ok ? r.json() : [])
        .then(setHistoryDocs)
        .catch(console.error);
    }
  }, [activeTab, patientId, accessToken]);

  if (!patient) {
    return <div className="d-flex justify-content-center p-5">Загрузка данных пациента...</div>;
  }

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
          {historyDocs.length > 0 ? (
            <PatientDocumentList
              documents={historyDocs}
              onDelete={null}
            />
          ) : (
            <p>У пациента нет загруженных документов.</p>
          )}
        </div>
      )}
    </div>
  );
}
