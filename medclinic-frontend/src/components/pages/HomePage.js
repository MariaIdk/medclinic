// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/HomePage.css';

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
    <div className="d-flex flex-column min-vh-100">
      <header className="bg-light">
        <nav className="navbar navbar-expand-lg navbar-light container">
          <div className="container-fluid">
            <a className="navbar-brand fs-3 fw-bold text-primary" href="/">MedClinic</a>
            
            <button className="navbar-toggler" type="button" 
              onClick={() => setShowAuthOptions(!showAuthOptions)}>
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a href="/" className="nav-link active">Главная</a>
                </li>
                <li className="nav-item">
                  <a href="/licenses" className="nav-link">Лицензии</a>
                </li>
                <li className="nav-item">
                  <a href="/schedule" className="nav-link">Расписание</a>
                </li>
              </ul>
              
              <div className="d-flex">
                {isLoggedIn ? (
                  <button className="btn btn-outline-primary" 
                    onClick={handleDashboardClick}>
                    Личный кабинет
                  </button>
                ) : (
                  <div className="dropdown">
                    <button className="btn btn-primary dropdown-toggle" 
                      onClick={() => setShowAuthOptions(!showAuthOptions)}>
                      Регистрация / Вход
                    </button>
                    
                    {showAuthOptions && (
                      <div className="dropdown-menu show">
                        <button className="dropdown-item" 
                          onClick={handleRegisterClick}>Зарегистрироваться</button>
                        <button className="dropdown-item" 
                          onClick={handleLoginClick}>Войти</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="container my-5 flex-grow-1">
        <div className="text-center py-5">
          <h1 className="display-4 mb-4">Добро пожаловать в MedClinic</h1>
          <p className="lead text-muted">Здесь будет информация о клинике.</p>
        </div>
      </main>

      <footer className="bg-light mt-auto py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <div>© 2025 MedClinic</div>
              <div>Адрес: г. Москва, ул. Примерная, д. 1</div>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div>Телефон: +7 (495) 123‑45‑67</div>
              <div>Email: info@medclinic.ru</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}