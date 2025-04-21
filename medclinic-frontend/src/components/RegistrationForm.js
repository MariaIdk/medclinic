// src/components/RegistrationForm.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api'; // ← путь к api/index.js
import { AuthContext } from '../contexts/AuthContext';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
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
    const { username, firstName, lastName, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser({ username, password, firstName, lastName });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>Регистрация</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Логин:</label>
        <input name="username" value={formData.username} onChange={handleChange} required />

        <label>Имя:</label>
        <input name="firstName" value={formData.firstName} onChange={handleChange} required />

        <label>Фамилия:</label>
        <input name="lastName" value={formData.lastName} onChange={handleChange} required />

        <label>Пароль:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label>Повтор пароля:</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? 'Загрузка...' : 'Зарегистрироваться'}</button>
      </form>
    </div>
  );
}
