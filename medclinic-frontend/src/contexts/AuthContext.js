// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const id    = localStorage.getItem('userId');
    if (token) setAccessToken(token);
    if (id)    setUserId(Number(id));
  }, []);

  const login = (token, id) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', id);
    setAccessToken(token);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setAccessToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
