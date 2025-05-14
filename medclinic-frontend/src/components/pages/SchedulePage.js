//SchedulePage.js
import React, { useEffect, useState, useContext } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { authFetch } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import Header from "../common/Header";
import Footer from "../common/Footer";
import "../../styles/AppointmentSchedule.css";

const weekdays = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
];

function formatTime(str) {
  if (!str) return "";
  const [h, m] = str.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString().slice(-2);
  return `${d}.${m}.${y}`;
}

export default function SchedulePage() {
  const { accessToken } = useContext(AuthContext);
  const [schedules, setSchedules]     = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [weekOffset, setWeekOffset]   = useState(0);

  // загрузка данных
  useEffect(() => {
    authFetch("http://localhost:8000/api/clinic-schedules/")
      .then(r => r.ok ? r.json() : [])
      .then(setSchedules)
      .catch(console.error);

    authFetch("http://localhost:8000/api/specialties/")
      .then(r => r.ok ? r.json() : [])
      .then(setSpecialties)
      .catch(console.error);
  }, [accessToken]);

  // группировка по врачу
  const byDoctor = {};
  schedules.forEach(s => {
    if (!byDoctor[s.doctor]) {
      byDoctor[s.doctor] = {
        name: s.doctor_name,
        cabinet: s.cabinet,
        specialty: s.direction,
        days: {}
      };
    }
    byDoctor[s.doctor].days[s.weekday] = [s.start_time, s.end_time];
  });

  // группировка по направлению
  const bySpec = {};
  Object.values(byDoctor).forEach(doc => {
    const sp = doc.specialty;
    if (!bySpec[sp]) {
      const spec = specialties.find(x => x.id === sp);
      bySpec[sp] = { name: spec?.name || "Без направления", doctors: [] };
    }
    bySpec[sp].doctors.push(doc);
  });

  // расчёт границ недели
  const today = new Date();
  const dow   = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow - 1) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
            disabled={weekOffset === 0}
          >
            ‹
          </button>
          <h4 className="mb-0">
            Расписание с {formatDate(monday)} до {formatDate(sunday)}
          </h4>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setWeekOffset(o => o + 1)}
            disabled={weekOffset === 5}
          >
            ›
          </button>
        </div>

        {Object.entries(bySpec).map(([specId, { name, doctors }]) => (
          <div key={specId} className="schedule-grid mb-5">
            {/* объединённая ячейка с направлением */}
            <div className="cell spec-header" style={{ gridColumn: "1 / -1" }}>
              {name}
            </div>
            {/* шапка таблицы */}
            <div className="cell header">Врач</div>
            <div className="cell header">Кабинет</div>
            {weekdays.map(w => (
              <div key={w.value} className="cell header">
                {w.label}
                <div className="grid-date">
                  {formatDate(new Date(
                    monday.getFullYear(),
                    monday.getMonth(),
                    monday.getDate() + w.value - 1
                  ))}
                </div>
              </div>
            ))}

            {/* строки врачей */}
            {doctors.map(doc => (
              <React.Fragment key={doc.name + doc.cabinet}>
                <div className="cell">{doc.name}</div>
                <div className="cell">{doc.cabinet}</div>
                {weekdays.map(w => (
                  <div
                    key={w.value}
                    className={`cell timeslot ${doc.days[w.value] ? "active" : "inactive"}`}
                  >
                    {doc.days[w.value]
                      ? `${formatTime(doc.days[w.value][0])}–${formatTime(doc.days[w.value][1])}`
                      : ""
                    }
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
