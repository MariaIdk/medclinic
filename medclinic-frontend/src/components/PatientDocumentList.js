import React, { useState, useEffect, useRef } from 'react';
import './PatientDocumentList.css';

const PatientDocumentList = ({ documents, onDelete }) => {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const documentListRef = useRef(null);

  // Обработчик клика вне элемента документа
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (documentListRef.current && !documentListRef.current.contains(event.target)) {
        setSelectedDocId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDocClick = (docId, event) => {
    // Останавливаем всплытие, чтобы клик по документу не вызывал handleClickOutside
    event.stopPropagation();
    setSelectedDocId(prev => prev === docId ? null : docId);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="document-list" ref={documentListRef}>
      <ul>
        {documents.map((doc) => {
          const isSelected = selectedDocId === doc.id;

          return (
            <li 
              key={doc.id} 
              className={`document-item ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleDocClick(doc.id, e)}
            >
              <div className="document-info">
                <strong>{doc.description}</strong>
                <div>Добавлено: {doc.uploaded_by === 'patient' ? 'Пациентом' : doc.uploaded_by_doctor?.full_name || 'врачом'}</div>
                <div>Дата: {doc.created_at ? formatDate(doc.created_at) : '—'}</div>
              </div>

              {isSelected && (
                <div className="document-options-inline" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => window.open(doc.document_file, '_blank')}>Открыть документ</button>
                  <button onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.document_file;
                    link.download = doc.description;
                    link.click();
                  }}>Скачать документ</button>
                  {doc.uploaded_by === 'patient' && (
                    <button onClick={() => onDelete(doc.id)}>Удалить документ</button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PatientDocumentList;