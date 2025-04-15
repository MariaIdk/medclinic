// src/components/PatientDocumentList.js
import React from 'react';

const PatientDocumentList = ({ documents }) => {
    return (
        <div>
            <h2>Список документов</h2>
            {documents.length > 0 ? (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc.id}>
                            <h3>{doc.document_type}</h3>
                            <a href={`http://localhost:8000${doc.document_file}`} target="_blank" rel="noopener noreferrer">
                                Скачать
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Документы не найдены</p>
            )}
        </div>
    );
};

export default PatientDocumentList;
