// PatientDocumentList.js
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/PatientDocumentList.css';

const PatientDocumentList = ({ documents, onDelete }) => {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const documentListRef = useRef(null);


  const downloadFile = async (documentId) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`http://127.0.0.1:8000/api/patient-documents/${documentId}/download/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.detail || 'Ошибка при скачивании документа');
      return;
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_${documentId}.pdf`; // Можешь добавить название из doc.description
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  

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


                  <button onClick={() => downloadFile(doc.id)}>
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
