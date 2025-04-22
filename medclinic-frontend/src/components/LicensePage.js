// src/components/LicensePage.js
import React, { useEffect, useState, useContext } from 'react';
import { authFetch } from './api';
import { AuthContext } from '../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import './LicensePage.css';

export default function LicensePage() {
  const { accessToken } = useContext(AuthContext);
  const [licenses, setLicenses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('http://localhost:8000/api/licenses/')
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить лицензии');
        return res.json();
      })
      .then(setLicenses)
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [accessToken]);

  return (
    <>
      <Header />

      <main className="license-page">
        <h1>Лицензии клиники</h1>
        {error && <p className="error">{error}</p>}
        <ul className="license-list">
          {licenses.map(lic => (
            <li key={lic.id} className="license-item">
              <strong>{lic.description}</strong>
              <div>
                <a 
                  href={lic.license_file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Открыть
                </a>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  );
}
