// src/components/Header.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
// import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { accessToken, logout } = useContext(AuthContext);
//   const history = useHistory();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // history.push('/login');
    navigate('/login');
  };

  return (
    <header>
      {accessToken && <button onClick={handleLogout}>Выйти</button>}
    </header>
  );
}
