// src/components/PersonalInfo.js
import React, { useState, useEffect, useContext } from 'react';
import { authFetch } from './api';
import { AuthContext } from '../contexts/AuthContext';
import './PersonalInfo.css';

export default function PersonalInfo({ patientId }) {
  const { accessToken } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);     // Исходные данные
  const [form, setForm] = useState(null);           // Данные формы
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // — Загрузка данных при монтировании
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
    // Откатываем значения к оригинальным
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

  if (loading) return <p>Загрузка...</p>;
  if (error && !isEditing) return <p className="error">{error}</p>;

  return (
    <div className="personal-info">
      <h2>Личная информация</h2>
      {error && isEditing && <p className="error">{error}</p>}

      <div className="info-grid">
        {/* Имя */}
        <label>Имя:</label>
        {isEditing ? (
          <input name="first_name" value={form.first_name} onChange={handleChange} />
        ) : (
          <span>{patient.first_name}</span>
        )}

        {/* Фамилия */}
        <label>Фамилия:</label>
        {isEditing ? (
          <input name="last_name" value={form.last_name} onChange={handleChange} />
        ) : (
          <span>{patient.last_name}</span>
        )}

        {/* Отчество */}
        <label>Отчество:</label>
        {isEditing ? (
          <input name="patronymic" value={form.patronymic} onChange={handleChange} />
        ) : (
          <span>{patient.patronymic || '—'}</span>
        )}

        {/* Дата рождения */}
        <label>Дата рождения:</label>
        {isEditing ? (
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
          />
        ) : (
          <span>{patient.date_of_birth}</span>
        )}

        {/* Email */}
        <label>Email:</label>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        ) : (
          <span>{patient.email}</span>
        )}

        {/* Телефон */}
        <label>Телефон:</label>
        {isEditing ? (
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
        ) : (
          <span>{patient.phone_number}</span>
        )}

        {/* Адрес */}
        <label>Адрес:</label>
        {isEditing ? (
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        ) : (
          <span>{patient.address}</span>
        )}
      </div>

      <div className="buttons">
        {isEditing ? (
          <>
            <button className="btn btn-save" onClick={handleSave}>Сохранить изменения</button>
            <button className="btn btn-cancel" onClick={handleCancel}>Отмена</button>
          </>
        ) : (
          <button className="btn btn-edit" onClick={handleEdit}>Редактировать информацию</button>
        )}
      </div>
    </div>
  );
}
