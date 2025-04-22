// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate }     from 'react-router-dom';
import Header              from './Header';
import Footer              from './Footer';
import './HomePage.css';

export default function HomePage() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn]           = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  return (
    <>
      <Header />

      {showAuthOptions && !isLoggedIn && (
        <div className="auth-popup">
          <button onClick={() => navigate('/register')}>Зарегистрироваться</button>
          <button onClick={() => navigate('/login')}>Войти</button>
        </div>
      )}

      <main className="main-content">
        <h1>Добро пожаловать в MedClinic</h1>
        <p>Здесь будет информация о клинике.</p>
      </main>

      <Footer />
    </>
  );
}
