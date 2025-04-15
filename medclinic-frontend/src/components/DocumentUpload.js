import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = ({ patientId }) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  
  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('document', document);
    formData.append('patient_id', patientId);
    
    try {
      await axios.post('http://localhost:8000/api/patient-documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Документ загружен');
    } catch (error) {
      setError('Ошибка при загрузке документа');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Загрузить документ</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Загрузить</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default DocumentUpload;
