// src/components/Header.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css';

export default function Header() {
  const { accessToken } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const btnRef = useRef();
  const menuRef = useRef();

  useEffect(() => {
    const handler = e => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__logo">
          <NavLink to="/" end>MedClinic</NavLink>
        </div>
        <div className="header__auth">
          {accessToken ? (
            <button onClick={() => navigate('/dashboard')}>
              Личный кабинет
            </button>
          ) : (
            <>
              <button ref={btnRef} className="header__auth-btn" onClick={() => setOpen(o => !o)}>
                Регистрация&nbsp;/&nbsp;Вход
              </button>
              {open && (
                <div ref={menuRef} className="header__auth-menu">
                  <NavLink to="/register">Зарегистрироваться</NavLink>
                  <NavLink to="/login">Войти</NavLink>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <nav className="header__nav">
        <NavLink to="/"       end       className={({ isActive }) => isActive ? 'active' : ''}>Главная</NavLink>
        <NavLink to="/licenses"         className={({ isActive }) => isActive ? 'active' : ''}>Лицензии</NavLink>
        <NavLink to="/schedule"         className={({ isActive }) => isActive ? 'active' : ''}>Расписание</NavLink>
      </nav>
    </header>
  );
}
