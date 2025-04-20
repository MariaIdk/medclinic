// src/components/AppointmentSchedule.js
import React, { useEffect, useState } from "react";
import "./AppointmentSchedule.css";

const weekdays = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
];

// Форматирует "HH:MM:SS" → "HH:MM"
function formatTime(str) {
  if (!str) return "";
  const [h, m] = str.split(":");
  return `${h.padStart(2, "0")}\u003A${m.padStart(2, "0")}`;
}

export default function AppointmentSchedule({ onTimeClick }) {
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredMap, setFilteredMap] = useState({});

  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState("");

  // Загрузка расписаний и направлений
  useEffect(() => {
    fetch("http://localhost:8000/api/clinic-schedules/")
      .then(res => res.json())
      .then(data => setSchedules(data))
      .catch(console.error);

    fetch("http://localhost:8000/api/specialties/")
      .then(res => res.json())
      .then(data => setSpecialties(data))
      .catch(console.error);
  }, []);

  // Обновляем список врачей при выборе направления
  useEffect(() => {
    const docs = schedules
      .filter(s => !selectedSpec || s.direction === +selectedSpec)
      .map(s => ({ id: s.doctor, name: s.doctor_name }))
      .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
    setDoctors(docs);
    // Сбросим выбор врача и дня
    setSelectedDoctor("");
    setSelectedWeekday("");
  }, [schedules, selectedSpec]);

  // Фильтрация и группировка
  useEffect(() => {
    let arr = schedules;
    if (selectedSpec) arr = arr.filter(s => s.direction === +selectedSpec);
    if (selectedDoctor) arr = arr.filter(s => s.doctor === +selectedDoctor);
    if (selectedWeekday) arr = arr.filter(s => s.weekday === +selectedWeekday);

    const map = {};
    arr.forEach(s => {
      const name = s.doctor_name;
      if (!map[name]) map[name] = { cabinet: s.cabinet, days: {} };
      map[name].days[s.weekday] = [s.start_time, s.end_time];
    });
    setFilteredMap(map);
  }, [schedules, selectedSpec, selectedDoctor, selectedWeekday]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <label htmlFor="spec-select">Направление:</label>
        <select
          id="spec-select"
          value={selectedSpec}
          onChange={e => setSelectedSpec(e.target.value)}
        >
          <option value="">Все</option>
          {specialties.map(sp => (
            <option key={sp.id} value={sp.id}>{sp.name}</option>
          ))}
        </select>

        <label htmlFor="doc-select">Врач:</label>
        <select
          id="doc-select"
          value={selectedDoctor}
          onChange={e => setSelectedDoctor(e.target.value)}
        >
          <option value="">Все</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label htmlFor="day-select">День:</label>
        <select
          id="day-select"
          value={selectedWeekday}
          onChange={e => setSelectedWeekday(e.target.value)}
        >
          <option value="">Все</option>
          {weekdays.map(w => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
      </div>

      <div className="schedule-grid">
        {/* Заголовок */}
        <div className="cell header">Врач</div>
        <div className="cell header">Кабинет</div>
        {weekdays.map(w => (
          <div key={w.value} className="cell header">{w.label}</div>
        ))}

        {/* Данные */}
        {Object.entries(filteredMap).map(([docName, { cabinet, days }]) => (
          <React.Fragment key={docName}>
            <div className="cell">{docName}</div>
            <div className="cell">{cabinet}</div>

            {weekdays.map(w => {
              const times = days[w.value];
              return (
                <div
                  key={w.value}
                  className={`cell timeslot ${times ? 'active' : 'inactive'}`}
                  onClick={() => times && onTimeClick?.({
                    doctor: docName,
                    day: w.label,
                    time: `${formatTime(times[0])}–${formatTime(times[1])}`
                  })}
                >
                  {times ? `${formatTime(times[0])}–${formatTime(times[1])}` : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
