// src/App.js

import React from 'react';
import PatientDashboard from './components/PatientDashboard';


function App() {
    // Для примера используем жестко закодированный ID пациента
    const patientId = 1;

    return (
        <div className="App">
            <PatientDashboard patientId={patientId} />
        </div>
    );
}

export default App;
