import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = ({ patientId }) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ✅ добавлено

  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('document_file', document); // ✅ исправлен ключ
    formData.append('patient_id', patientId);
    formData.append('document_type', 'анализы');
    formData.append('uploaded_by', 'patient');

    setLoading(true); // ✅ до запроса

    try {
      await axios.post('http://localhost:8000/api/patient-documents/upload_document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Документ загружен');
      setDocument(null);
    } catch (error) {
      setError('Ошибка при загрузке документа');
      console.error(error);
    } finally {
      setLoading(false); // ✅ после завершения
    }
  };

  return (
    <div>
      <h2>Загрузить документ</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DocumentUpload;
