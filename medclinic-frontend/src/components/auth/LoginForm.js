// src/components/LoginForm.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { AuthContext } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей Bootstrap

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Вход</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Логин:</label>
                  <input 
                    name="username" 
                    className="form-control"
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Пароль:</label>
                  <input 
                    type="password" 
                    name="password" 
                    className="form-control"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Загрузка...' : 'Войти'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
