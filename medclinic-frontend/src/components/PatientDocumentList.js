// PatientDocumentList.js
import React, { useState, useEffect, useRef } from 'react';
import './PatientDocumentList.css';

const PatientDocumentList = ({ documents, onDelete }) => {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const documentListRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (documentListRef.current && !documentListRef.current.contains(event.target)) {
        setSelectedDocId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDocClick = (docId, event) => {
    event.stopPropagation();
    setSelectedDocId(prev => (prev === docId ? null : docId));
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="document-list" ref={documentListRef}>
      <ul>
        {documents.map((doc) => {
          const isSelected = selectedDocId === doc.id;
          // Формируем имя того, кто загрузил документ
          const uploader = doc.uploaded_by === 'patient'
            ? 'Пациентом'
            : (doc.uploaded_by_doctor
                ? `${doc.uploaded_by_doctor.last_name} ${doc.uploaded_by_doctor.first_name}`
                : 'Врачом');

          return (
            <li
              key={doc.id}
              className={`document-item ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleDocClick(doc.id, e)}
            >
              <div className="document-info">
                <strong>{doc.description}</strong>
                <div>Загружено: {uploader}</div>
                <div>Дата: {doc.created_at ? formatDate(doc.created_at) : '—'}</div>
              </div>


              
              {/* {isSelected && (
              <div className="document-options-inline" onClick={e => e.stopPropagation()}>
                  <button onClick={() => window.open(doc.document_file, '_blank')}>
                  Открыть
                  </button>
                  <button onClick={() =>
                  // здесь вместо прямой ссылки на media используем наш API
                  window.open(
                      `http://127.0.0.1:8000/api/patient-documents/${doc.id}/download/`,
                      '_blank'
                  )
                  }>
                  Скачать
                  </button>
                  {doc.uploaded_by === 'patient' && (
                  <button onClick={() => onDelete(doc.id)}>Удалить</button>
                  )}
              </div>
              )} */}



              {isSelected && (
                <div className="document-options-inline" onClick={e => e.stopPropagation()}>
                  {/* 1) Открыть — прямой URL, без принудительного скачивания */}
                  <button
                    onClick={() =>
                      window.open(doc.document_file, '_blank', 'noopener')
                    }
                  >
                    Открыть
                  </button>

                  {/* 2) Скачать — через download‑endpoint, чтобы принудительно скачать */}
                  <button
                    onClick={() =>
                      window.open(
                        `http://127.0.0.1:8000/api/patient-documents/${doc.id}/download/`,
                        '_blank',
                        'noopener'
                      )
                    }
                  >
                    Скачать
                  </button>

                  {doc.uploaded_by === 'patient' && (
                    <button onClick={() => onDelete(doc.id)}>Удалить</button>
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
