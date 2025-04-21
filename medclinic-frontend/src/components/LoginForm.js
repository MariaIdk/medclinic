// src/components/LoginForm.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './api';  // ← путь к api/index.js
import { AuthContext } from '../contexts/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access, refresh } = await loginUser(formData);
      // сохраняем токены и userId
      const payload = JSON.parse(atob(access.split('.')[1]));
      login(access, payload.user_id);
      localStorage.setItem('refreshToken', refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Логин:</label>
        <input name="username" value={formData.username} onChange={handleChange} required />

        <label>Пароль:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? 'Загрузка...' : 'Войти'}</button>
      </form>
    </div>
  );
}
