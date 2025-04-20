import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Получение всех документов пациента
export const getPatientDocuments = async (patientId) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/patient-documents/?patient=${patientId}`);
    if (!res.ok) throw new Error('Ошибка при получении документов');
    return await res.json();
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    throw error;
  }
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

// Удаление документа пациента по ID
export const deletePatientDocument = async (documentId) => {
  try {
    const response = await axios.delete(`http://127.0.0.1:8000/api/patient-documents/${documentId}/`);
    console.log('Документ удалён:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении документа:', error);
    throw error;
  }
};