// src/components/AppointmentSchedule.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const weekdays = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
];

export default function AppointmentSchedule({ onDoctorSelect }) {
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState("");

  // Загрузка расписаний и списка специализаций
  useEffect(() => {
    axios.get('http://localhost:8000/api/clinic-schedules/')
      .then(res => {
        setSchedules(res.data);
      })
      .catch(err => console.error("❌ Ошибка загрузки расписания", err));

    axios.get('http://localhost:8000/api/specialties/')
      .then(res => setSpecialties(res.data))
      .catch(err => console.error("❌ Ошибка загрузки направлений", err));
  }, []);

  // Пересчёт фильтрованного массива и списка врачей для селекта
  useEffect(() => {
    let arr = schedules;
    if (selectedSpecialty) arr = arr.filter(s => s.direction === +selectedSpecialty);
    if (selectedDoctor)    arr = arr.filter(s => s.doctor === +selectedDoctor);
    if (selectedWeekday)   arr = arr.filter(s => s.weekday === +selectedWeekday);
    setFilteredSchedules(arr);

    const docs = schedules
      .filter(s => !selectedSpecialty || s.direction === +selectedSpecialty)
      .map(s => ({ id: s.doctor, name: s.doctor_name }))
      .filter((v, i, self) => self.findIndex(d => d.id === v.id) === i);
    setDoctors(docs);
  }, [schedules, selectedSpecialty, selectedDoctor, selectedWeekday]);

  // Группируем по специализации → врачу → дню недели
  const grouped = {};
  filteredSchedules.forEach(s => {
    const specName = specialties.find(sp => sp.id === s.direction)?.name || "Без направления";
    grouped[specName] = grouped[specName] || {};
    grouped[specName][s.doctor_name] = grouped[specName][s.doctor_name] || { cabinet: s.cabinet, days: {} };
    grouped[specName][s.doctor_name].days[s.weekday] = `${s.start_time}–${s.end_time}`;
  });

  return (
    <div className="appointment-schedule">
      <h2>Запись к врачу</h2>

      <div className="filters">
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
          <option value="">— выбрать —</option>
          {specialties.map(sp =>
            <option key={sp.id} value={sp.id}>{sp.name}</option>
          )}
        </select>

        {selectedSpecialty && (
          <>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">Все врачи</option>
              {doctors.map(d =>
                <option key={d.id} value={d.id}>{d.name}</option>
              )}
            </select>

            <select value={selectedWeekday} onChange={e => setSelectedWeekday(e.target.value)}>
              <option value="">Все дни</option>
              {weekdays.map(w =>
                <option key={w.value} value={w.value}>{w.label}</option>
              )}
            </select>
          </>
        )}
      </div>

      {!schedules.length && <p>Загрузка расписания...</p>}

      {Object.entries(grouped).map(([spec, docs]) => (
        <table key={spec} className="schedule-table">
          <thead>
            <tr><th colSpan="8">{spec}</th></tr>
            <tr>
              <th>Врач</th><th>Кабинет</th>
              {weekdays.map(w => <th key={w.value}>{w.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(docs).map(([docName, { cabinet, days }]) => (
              <tr key={docName} onClick={() => onDoctorSelect?.(docName)}>
                <td>{docName}</td>
                <td>{cabinet}</td>
                {weekdays.map(w =>
                  <td key={w.value}>{days[w.value] || ""}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      {selectedSpecialty && filteredSchedules.length === 0 && (
        <p>Нет доступного расписания по выбранным фильтрам.</p>
      )}
    </div>
  );
}
