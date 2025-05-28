// src/components/doctor_dashboard/DoctorAppointmentEdit.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/AppointmentSchedule.css';

// Убираем возможное окончание `/api` из базового URL
const rawApiUrl = process.env.REACT_APP_API_URL || '';
const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

export default function DoctorAppointmentEdit() {
  const { accessToken } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [data, setData]         = useState(null);
  const [status, setStatus]     = useState('');
  const [diagnosis, setDiagnosis]       = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [docs, setDocs]         = useState([]);  // уже связанные документы
  const [newFiles, setNewFiles] = useState([]);  // { file: File, description: string }
  const originalStatus = useRef('');

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`/api/appointments/${id}/`);
        if (!res.ok) throw new Error('Не удалось загрузить приём');
        const json = await res.json();
        setData(json);
        setStatus(json.status);
        originalStatus.current = json.status;
        setDiagnosis(json.diagnosis || '');
        setRecommendations(json.recommendations || '');
        setDocs(json.documents || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) load();
  }, [id, accessToken]);

  // Обработчик выбора файлов: создаём массив объектов с пустым описанием
  const onFileChange = e => {
    const files = Array.from(e.target.files);
    setNewFiles(files.map(f => ({ file: f, description: '' })));
  };

  // Изменение описания для нового файла
  const onDescChange = (idx, text) => {
    setNewFiles(nf => {
      const copy = [...nf];
      copy[idx] = { ...copy[idx], description: text };
      return copy;
    });
  };

  // Удалить уже прикреплённый документ из списка
  const removeExistingDoc = id => {
    setDocs(d => d.filter(x => x.id !== id));
  };

  // Удалить только что добавленный файл из newFiles
  const removeNewFile = idx => {
    setNewFiles(nf => nf.filter((_, i) => i !== idx));
  };

  // Помощник для открытия документа в новой вкладке
  const getDocUrl = (doc) => {
    let url = doc.document_file;
    if (!/^https?:\/\//i.test(url)) {
      url = `${API_URL}${url}`;
    }
    return url;
  };

  const canEditDetails = status === 'completed';
  const allDescFilled = newFiles.every(n => n.description.trim() !== '');
  const requiredFilled =
    status === 'completed'
      ? diagnosis.trim() && recommendations.trim() && (docs.length + newFiles.length > 0) && allDescFilled
      : true;
  const saveEnabled = (
    status !== data?.status
      ? (status !== 'completed' || requiredFilled)
      : (status === 'completed' ? requiredFilled : true)
  );

  const handleSave = async () => {
    if (
      originalStatus.current === 'completed' &&
      status !== 'completed' &&
      !window.confirm(
        'Вы уверены? При смене статуса будут утеряны диагноз, рекомендации и прикреплённые документы.'
      )
    ) {
      return;
    }

    // 1) upload new docs
    let uploadedIds = [];
    for (let { file, description } of newFiles) {
      const form = new FormData();
      form.append('document_file', file);
      form.append('description', description);
      form.append('patient', data.patient);
      form.append('uploaded_by', 'doctor');
      const upRes = await authFetch('/api/patient-documents/', {
        method: 'POST',
        body: form,
        headers: {}
      });
      if (upRes.ok) {
        const upJson = await upRes.json();
        uploadedIds.push(upJson.id);
      } else {
        const err = await upRes.json();
        return alert(err.detail || 'Ошибка загрузки документа');
      }
    }

    // 2) PATCH appointment
    const payload = {
      status,
      diagnosis: canEditDetails ? diagnosis : '',
      recommendations: canEditDetails ? recommendations : '',
      documents: canEditDetails
        ? [...docs.map(d => d.id), ...uploadedIds]
        : []
    };
    const res = await authFetch(`/api/appointments/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      return alert(err.detail || 'Ошибка сохранения');
    }
    alert('Сохранено');
    navigate(-1);
  };

  if (loading) return <div className="schedule-wrapper">Загрузка...</div>;
  if (error)   return <div className="schedule-wrapper">Ошибка: {error}</div>;

  return (
    <div className="schedule-wrapper">
      <h2>Детали приёма</h2>

      <div className="form-group">
        <label>Дата и время</label>
        <input value={`${data.appointment_date} ${data.appointment_time.slice(0,5)}`} readOnly/>
      </div>

      <div className="form-group">
        <label>Кабинет</label>
        <input value={data.cabinet || '—'} readOnly/>
      </div>

      <div className="form-group">
        <label>Пациент</label>
        <a href={`/patients/${data.patient}`} target="_blank" rel="noopener">
          {data.patient_name}
        </a>
      </div>

      <div className="form-group">
        <label>Услуга</label>
        <input value={data.service_name || ''} readOnly/>
      </div>

      <div className="form-group">
        <label>Причина обращения</label>
        <textarea value={data.reason} readOnly/>
      </div>

      <div className="form-group">
        <label>Статус</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="scheduled">Назначен</option>
          <option value="in_progress">Идёт</option>
          <option value="completed">Проведен</option>
          <option value="no_show">Не пришёл</option>
        </select>
      </div>

      {status === 'completed' && (
        <>
          <div className="form-group">
            <label>Диагноз</label>
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Рекомендации</label>
            <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Уже прикреплённые документы</label>
            {docs.length === 0
              ? <p>Нет</p>
              : docs.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <button
                      className="link-button"
                      onClick={() => window.open(getDocUrl(doc), '_blank', 'noopener')}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        color: '#007bff',
                        cursor: 'pointer'
                      }}
                    >
                      {doc.description}
                    </button>
                    <button
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => removeExistingDoc(doc.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
            }
          </div>

          <div className="form-group">
            <label>Добавить новые документы</label>
            <input type="file" multiple onChange={onFileChange} />
            {newFiles.map((nf, i) => (
              <div key={i} style={{ marginTop: '0.5rem' }}>
                <strong>{nf.file.name}</strong>
                <button
                  style={{ marginLeft: '0.5rem' }}
                  onClick={() => removeNewFile(i)}
                >
                  ×
                </button>
                <input
                  type="text"
                  placeholder="Описание документа"
                  value={nf.description}
                  onChange={e => onDescChange(i, e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  required
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="form-actions" style={{ marginTop: '1rem' }}>
        <button
          className="modal-confirm"
          disabled={!saveEnabled}
          onClick={handleSave}
        >
          Сохранить
        </button>
        <button onClick={() => navigate(-1)} style={{ marginLeft: '0.5rem' }}>
          Отмена
        </button>
      </div>
    </div>
  );
}
