//DocumentUpload.js
import React, { useState, useContext } from 'react';
import { uploadPatientDocument } from '../../../api';
import { AuthContext } from '../../../contexts/AuthContext';

export default function DocumentUpload({ patientId, onUpload }) {
  const { accessToken } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');     // новое поле описания
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleDescriptionChange = e => {
    setDescription(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || !description) {
      setError('Выберите файл и введите описание');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await uploadPatientDocument({
        patientId,
        file,
        description
      });
      // после успешной загрузки сбрасываем форму
      setFile(null);
      setDescription('');
      // если нужно обновить список в родительском компоненте
      if (onUpload) onUpload();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось загрузить документ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-upload">
      <h2>Загрузить документ</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Описание документа:</label>
        <input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          required
        />

        <label>Файл:</label>
        <input type="file" onChange={handleFileChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
    </div>
  );
}
