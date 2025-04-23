// src/components/PersonalInfo.js
import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authFetch } from './api';
import { AuthContext } from '../contexts/AuthContext';
import './PersonalInfo.css'; // ваши кастомные стили (если нужны)

export default function PersonalInfo({ patientId }) {
  const { accessToken } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch(`http://localhost:8000/api/patients/${patientId}/`);
        if (!res.ok) throw new Error('Не удалось загрузить данные');
        const data = await res.json();
        setPatient(data);
        setForm({
          first_name:    data.first_name || '',
          last_name:     data.last_name  || '',
          patronymic:    data.patronymic || '',
          date_of_birth: data.date_of_birth || '',
          email:         data.email      || '',
          phone_number:  data.phone_number || '',
          address:       data.address    || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, accessToken]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setForm({
      first_name:    patient.first_name,
      last_name:     patient.last_name,
      patronymic:    patient.patronymic || '',
      date_of_birth: patient.date_of_birth,
      email:         patient.email,
      phone_number:  patient.phone_number,
      address:       patient.address,
    });
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!window.confirm('Вы уверены, что хотите сохранить изменения?')) return;
    setLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:8000/api/patients/${patientId}/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        const msgs = Object.values(data).flat().join(' ');
        throw new Error(msgs || 'Ошибка сохранения');
      }
      const updated = await res.json();
      setPatient(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (error && !isEditing) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-5">
      <h2 className="mb-4">Личная информация</h2>
      {error && isEditing && <div className="alert alert-danger">{error}</div>}

      <form className="vstack gap-3">

  {/* Общие поля */}
  {[
    { label: 'Имя', name: 'first_name', type: 'text' },
    { label: 'Фамилия', name: 'last_name', type: 'text' },
    { label: 'Отчество', name: 'patronymic', type: 'text' },
    { label: 'Дата рождения', name: 'date_of_birth', type: 'date' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Телефон', name: 'phone_number', type: 'text' },
    { label: 'Адрес', name: 'address', type: 'textarea' },
  ].map(({ label, name, type }) => (
    <div key={name} className="row align-items-center">
      <label className="col-md-3 col-form-label">{label}</label>
      <div className="col-md-9">
        {isEditing ? (
          <input
            className="form-control"
            name={name}
            type={type}
            value={form[name]}
            onChange={handleChange}
          />
        ) : (
          <div className="form-control-plaintext">{patient[name] || '—'}</div>
        )}
      </div>
    </div>
  ))}



  {/* Кнопки */}
  <div className="d-flex gap-3">
    {isEditing ? (
      <>
        <button type="button" className="btn btn-success" onClick={handleSave}>
          Сохранить
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Отмена
        </button>
      </>
    ) : (
      <button type="button" className="btn btn-primary" onClick={handleEdit}>
        Редактировать
      </button>
    )}
  </div>

</form>
    </div>
  );
}
