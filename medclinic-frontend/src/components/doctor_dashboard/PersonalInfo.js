// src/components/doctor_dashboard/DoctorPersonalInfo.js
import React, { useState, useEffect, useContext } from 'react';
import { authFetch } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/PersonalInfo.css'; // можно переиспользовать стили из пациента

export default function DoctorPersonalInfo({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch(`${process.env.REACT_APP_API_URL}/doctors/${doctorId}/`);
        if (!res.ok) throw new Error('Не удалось загрузить данные');
        const data = await res.json();
        setDoctor(data);
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          patronymic: data.patronymic || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          education: data.education || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId, accessToken]);

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
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      patronymic: doctor.patronymic || '',
      email: doctor.email,
      phone_number: doctor.phone_number,
      education: doctor.education || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!window.confirm('Сохранить изменения?')) return;
    setLoading(true);
    try {
      const res = await authFetch(
        `${process.env.REACT_APP_API_URL}/doctors/${doctorId}/`,
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
      setDoctor(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (error && !isEditing) return <div className="alert alert-danger">{error}</div>;

  // Описание полей
  const fields = [
    { label: 'Имя',            name: 'first_name',    type: 'text',     editable: true },
    { label: 'Фамилия',        name: 'last_name',     type: 'text',     editable: true },
    { label: 'Отчество',       name: 'patronymic',    type: 'text',     editable: true },
    { label: 'Email',          name: 'email',         type: 'email',    editable: true },
    { label: 'Телефон',        name: 'phone_number',  type: 'text',     editable: true },
    { label: 'Специальность',  name: 'specialty',     type: 'readonly', editable: false, value: doctor.specialty.name },
    { label: 'Дата устройства',name: 'hired_date',    type: 'readonly', editable: false, value: doctor.hired_date },
    { label: 'Стаж (лет)',     name: 'total_experience_years', type: 'readonly', editable: false, value: doctor.total_experience_years },
    { label: 'Образование',    name: 'education',     type: 'textarea', editable: true },
  ];

  return (
    <div className="container my-5">
      <h2 className="mb-4">Мой профиль</h2>
      {error && isEditing && <div className="alert alert-danger">{error}</div>}
      <form className="vstack gap-3">
        {fields.map(({ label, name, type, editable, value }) => {
          const fieldValue = type === 'readonly' ? value : form[name];
          return (
            <div key={name} className="row align-items-center">
              <label className="col-md-3 col-form-label">{label}</label>
              <div className="col-md-9">
                {isEditing && editable
                  ? type === 'textarea'
                    ? <textarea
                        className="form-control"
                        name={name}
                        rows="3"
                        value={fieldValue}
                        onChange={handleChange}
                      />
                    : <input
                        className="form-control"
                        name={name}
                        type={type}
                        value={fieldValue}
                        onChange={handleChange}
                      />
                  : <div className="form-control-plaintext">{fieldValue ?? '—'}</div>
                }
              </div>
            </div>
          );
        })}

        <div className="d-flex gap-3 mt-3">
          {isEditing
            ? <>
                <button type="button" className="btn btn-success" onClick={handleSave}>
                  Сохранить
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Отмена
                </button>
              </>
            : <button type="button" className="btn btn-primary" onClick={handleEdit}>
                Редактировать
              </button>
          }
        </div>
      </form>
    </div>
  );
}
