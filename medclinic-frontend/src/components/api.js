import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Получение всех документов пациента
export const getPatientDocuments = (patientId) => {
  return api.get(`/patients/${patientId}/documents/`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching patient documents:', error);
      throw error;
    });
};

// Добавление документа пациента
export const uploadPatientDocument = (patientId, documentData) => {
  return api.post(`/patients/${patientId}/upload_document/`, documentData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error uploading patient document:', error);
      throw error;
    });
};
