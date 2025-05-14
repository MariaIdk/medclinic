import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AuthChoice.css';

export default function AuthChoice() {
  return (
    <div className="auth-choice">
      <h2>Войти или зарегистрироваться</h2>
      <div className="buttons">
        <Link to="/register" className="btn">Зарегистрироваться</Link>
        <Link to="/login" className="btn">Войти</Link>
      </div>
    </div>
  );
}