import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [open, setOpen] = useState(false);

  // закрыть меню при клике вне
  const handleBlur = () => setOpen(false);

  return (
    <header className="header" onBlur={handleBlur} tabIndex={0}>
      <div className="header__top">
        <div className="header__logo">MedClinic</div>
        <button
          className="header__auth-btn"
          onClick={() => setOpen(!open)}
        >
          Регистрация&nbsp;/&nbsp;Вход
        </button>
        {open && (
          <div className="header__auth-menu" onClick={e => e.stopPropagation()}>
            <Link to="/register">Зарегистрироваться</Link>
            <Link to="/login">Войти</Link>
          </div>
        )}
      </div>
      <nav className="header__nav">
        <Link to="/" className="active">Главная</Link>
        <Link to="/licenses">Лицензии</Link>
        <Link to="/schedule">Расписание</Link>
      </nav>
    </header>
  );
}
