// LicensePage.js
import React, { useEffect, useState } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import '../../styles/LicensePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function LicensePage() {
  const [licenses, setLicenses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const res = await fetch('http://localhost:8000/api/licenses/');
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        setLicenses(data);
      } catch (err) {
        console.error('Не удалось загрузить лицензии:', err);
        setError('Не удалось загрузить лицензии. Пожалуйста, попробуйте позже.');
      }
    }
    fetchLicenses();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="container my-5">
        <h1 className="text-center mb-4">Лицензии клиники</h1>

        {error && (
          <div className="alert alert-danger text-center">
            {error}
          </div>
        )}

        <div className="d-flex flex-column align-items-center gap-4">
          {licenses.map(lic => (
            <div key={lic.id} className="card license-card">
              <div className="card-body text-center">
                <h5 className="card-title mb-3">{lic.description}</h5>

                {lic.license_file_url?.match(/\.(png|jpe?g|gif)$/i) ? (
                  <div className="license-image-wrapper mx-auto">
                    <img
                      src={lic.license_file_url}
                      alt={lic.description}
                      className="license-image"
                    />
                  </div>
                ) : (
                  <a
                    href={lic.license_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    Открыть документ
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
