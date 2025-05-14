// PrivateRoute.js
import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// Защищённый маршрут для React Router v6
export default function PrivateRoute({ element: Component, ...rest }) {
  const { accessToken } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      element={
        accessToken ? (
          Component // Если токен есть, рендерим компонент
        ) : (
          <Navigate to="/login" /> // Если токена нет, перенаправляем на страницу входа
        )
      }
    />
  );
}
