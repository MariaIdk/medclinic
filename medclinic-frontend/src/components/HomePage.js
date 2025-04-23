// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate }     from 'react-router-dom';
import Header              from './Header';
import Footer              from './Footer';
import './HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function HomePage() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      {/* Auth Popup */}
      {showAuthOptions && !isLoggedIn && (
        <div className="auth-popup position-absolute end-0 mt-2 me-3 p-3 bg-white rounded shadow">
          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              Зарегистрироваться
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/login')}
            >
              Войти
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container my-5 flex-grow-1">
        <div className="text-center">
          <h1 className="display-4 mb-4">Добро пожаловать в MedClinic</h1>
          <p className="lead text-muted">Здесь будет информация о клинике.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
