// DocumentUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = ({ patientId }) => {
  const [document, setDocument] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!document || !description.trim()) {
      setError('Пожалуйста, укажите файл и описание документа.');
      return;
    }
    setError('');

    const formData = new FormData();
    formData.append('document_file', document);
    formData.append('patient', patientId);
    formData.append('description', description.trim());
    formData.append('uploaded_by', 'patient');

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/patient-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Документ успешно загружен');
      setDocument(null);
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке документа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Загрузить документ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Описание документа<span style={{color:'red'}}> *</span>:</label>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Введите описание"
            required
          />
        </div>
        <div>
          <label>Файл<span style={{color:'red'}}> *</span>:</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DocumentUpload;