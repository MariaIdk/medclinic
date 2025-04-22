import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => navigate('/register');
  const handleLoginClick = () => navigate('/login');
  const handleDashboardClick = () => navigate('/dashboard');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-logo">MedClinic</div>
          <div className="header-auth">
            {isLoggedIn ? (
              <button onClick={handleDashboardClick}>Личный кабинет</button>
            ) : (
              <button onClick={() => setShowAuthOptions(!showAuthOptions)}>
                Регистрация / Вход
              </button>
            )}
          </div>
        </div>
        <nav className="header-nav">
          <a href="/" className="active">Главная</a>
          <a href="/licenses">Лицензии</a>
          <a href="/schedule">Расписание</a>
        </nav>
      </header>

      {showAuthOptions && !isLoggedIn && (
        <div className="auth-popup">
          <button onClick={handleRegisterClick}>Зарегистрироваться</button>
          <button onClick={handleLoginClick}>Войти</button>
        </div>
      )}

      <main className="main-content">
        <h1>Добро пожаловать в MedClinic</h1>
        <p>Здесь будет информация о клинике.</p>
      </main>

      <footer className="footer">
        <div>© 2025 MedClinic</div>
        <div>Адрес: г. Москва, ул. Примерная, д. 1</div>
        <div>Телефон: +7 (495) 123‑45‑67</div>
        <div>Email: info@medclinic.ru</div>
      </footer>
    </>
  );
}
