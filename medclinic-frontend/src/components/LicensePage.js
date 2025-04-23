// src/components/LicensePage.js
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './LicensePage.css';

export default function LicensePage() {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const res = await fetch('http://localhost:8000/api/licenses/');
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        setLicenses(data);
      } catch (err) {
        console.error('Не удалось загрузить лицензии:', err);
      }
    }
    fetchLicenses();
  }, []);

  return (
    <>
      <Header />
      <main className="license-page">
        <h1>Лицензии клиники</h1>
        <ul className="license-list">
          {licenses.map(lic => (
            <li key={lic.id}>
              <strong>{lic.description}</strong>
              {/* Если это изображение, покажем его */}
              {lic.license_file_url?.match(/\.(png|jpe?g|gif)$/i) ? (
                <img
                  src={lic.license_file_url}
                  alt={lic.description}
                  className="license-image"
                />
              ) : (
                // иначе просто ссылка на файл
                <a
                  href={lic.license_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть файл
                </a>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
