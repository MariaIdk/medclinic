// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authFetch } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken]       = useState(null);
  const [userId, setUserId]                 = useState(null);
  const [role, setRole]                     = useState(null);
  const [patientProfileId, setPatientId]    = useState(null);
  const [doctorProfileId, setDoctorId]      = useState(null);
  const [loading, setLoading]               = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // 1) Считаем токен и userId из localStorage
  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    const u = localStorage.getItem('userId');
    if (t && u) {
      setAccessToken(t);
      setUserId(Number(u));
      setProfileLoading(true);
    }
    setLoading(false);
  }, []);

  // 2) Если есть токен+userId — подгружаем /users/me/ и профиль
  useEffect(() => {
    if (!accessToken || !userId) {
      setProfileLoading(false);
      return;
    }

    (async () => {
      try {
        // получаем данные самого пользователя
        const res = await authFetch(`${process.env.REACT_APP_API_URL}/users/me/`);
        if (!res.ok) throw new Error();
        const user = await res.json();

        const groups = user.groups || [];
        if (groups.includes('Врачи') || groups.includes('Doctors')) {
          setRole('doctor');
          // ищем профиль врача по user.id
          const drRes = await authFetch(
            `${process.env.REACT_APP_API_URL}/doctors/?user=${user.id}`
          );
          if (drRes.ok) {
            const drList = await drRes.json();
            if (drList.length) setDoctorId(drList[0].id);
          }
        } else {
          setRole('patient');
          // ищем профиль пациента по user.id
          const ptRes = await authFetch(
            `${process.env.REACT_APP_API_URL}/patients/?user=${user.id}`
          );
          if (ptRes.ok) {
            const ptList = await ptRes.json();
            if (ptList.length) setPatientId(ptList[0].id);
          }
        }
      } catch {
        setRole(null);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [accessToken, userId]);

  const login = (token, id) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', id);
    setAccessToken(token);
    setUserId(id);
    setProfileLoading(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setAccessToken(null);
    setUserId(null);
    setRole(null);
    setPatientId(null);
    setDoctorId(null);
  };

  // пока грузим localStorage или профили — ничего не рендерим
  if (loading || profileLoading) return null;

  return (
    <AuthContext.Provider value={{
      accessToken,
      userId,
      role,
      patientProfileId,
      doctorProfileId,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
