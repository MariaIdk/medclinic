// api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Добавляем интерцептор для авторизации
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Получение документов пациента
export const getPatientDocuments = async (patientId) => {
  try {
    const response = await api.get(`/patient-documents/?patient=${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    throw new Error(error.response?.data?.detail || 'Ошибка при получении документов');
  }
};

// Удаление документа пациента по ID
export const deletePatientDocument = async (documentId) => {
  try {
    // Используем созданный экземпляр api вместо чистого axios
    const response = await api.delete(`/patient-documents/${documentId}/`);
    console.log('Документ удалён:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении документа:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении документа');
  }
};