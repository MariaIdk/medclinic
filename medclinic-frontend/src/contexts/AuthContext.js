// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authFetch } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId]           = useState(null);
  const [role, setRole]               = useState(null); // 'patient' или 'doctor'
  const [loading, setLoading]         = useState(true);

  // 1) При старте читаем токен и id из localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const id    = localStorage.getItem('userId');
    if (token && id) {
      setAccessToken(token);
      setUserId(Number(id));
    }
    setLoading(false);
  }, []);

  // 2) Как только у нас есть токен и userId — подгружаем роль из /users/me/
  useEffect(() => {
    if (!accessToken || !userId) return;

    authFetch(`${process.env.REACT_APP_API_URL}/users/me/`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(user => {
        // Ожидаем array of strings в user.groups
        if (user.groups.includes('Врачи') || user.groups.includes('Doctors')) {
          setRole('doctor');
        } else if (user.groups.includes('Пациенты') || user.groups.includes('Patients')) {
          setRole('patient');
        } else {
          setRole(null);
        }
      })
      .catch(() => {
        setRole(null);
      });
  }, [accessToken, userId]);

  const login = (token, id) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', id);
    setAccessToken(token);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    setAccessToken(null);
    setUserId(null);
    setRole(null);
  };

  // Пока идёт чтение из localStorage — не рендерим приложение
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ accessToken, userId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
