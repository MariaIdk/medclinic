import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../components/api'; // проверь путь!
import './RegistrationForm.css';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        patronymic: formData.patronymic,
        dateOfBirth: formData.dateOfBirth,  // YYYY-MM-DD
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>Регистрация пациента</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Логин:</label>
        <input name="username" value={formData.username} onChange={handleChange} required />

        <label>Имя:</label>
        <input name="firstName" value={formData.firstName} onChange={handleChange} required />

        <label>Фамилия:</label>
        <input name="lastName" value={formData.lastName} onChange={handleChange} required />

        <label>Отчество:</label>
        <input name="patronymic" value={formData.patronymic} onChange={handleChange} />

        <label>Дата рождения:</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Телефон:</label>
        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />

        <label>Адрес:</label>
        <textarea name="address" value={formData.address} onChange={handleChange} required />

        <label>Пароль:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label>Повтор пароля:</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
);
}
