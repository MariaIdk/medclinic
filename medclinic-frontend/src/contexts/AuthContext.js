import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);  // Добавим флаг загрузки

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const id = localStorage.getItem('userId');

    if (token && id) {
      setAccessToken(token);
      setUserId(Number(id));
    }
    setLoading(false); // Завершаем загрузку
  }, []);

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
  };

  // Пока идет загрузка данных из localStorage, не рендерим остальные компоненты
  if (loading) {
    return null; // Или можно показать спиннер/загрузку
  }

  return (
    <AuthContext.Provider value={{ accessToken, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
