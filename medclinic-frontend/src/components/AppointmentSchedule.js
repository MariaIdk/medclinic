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

function formatTime(str) {
  if (!str) return "";
  const [h, m] = str.split(":");
  return `${h.padStart(2, "0")}\u003A${m.padStart(2, "0")}`;
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString().slice(-2);
  return `${d}.${m}.${y}`;
}

export default function AppointmentSchedule({ patientId }) {
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedSpec, setSelectedSpec] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const [modalStep, setModalStep] = useState(0);
  const [modalDoctorId, setModalDoctorId] = useState(null);
  const [modalDoctorName, setModalDoctorName] = useState("");
  const [modalDateObj, setModalDateObj] = useState(null);
  const [modalDate, setModalDate] = useState("");
  const [modalDuration, setModalDuration] = useState(15);
  const [modalDirection, setModalDirection] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/clinic-schedules/")
      .then(res => res.json()).then(setSchedules).catch(console.error);
    fetch("http://localhost:8000/api/specialties/")
      .then(res => res.json()).then(setSpecialties).catch(console.error);
    fetch("http://localhost:8000/api/services/")
      .then(res => res.json()).then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    const docs = schedules
      .filter(s => !selectedSpec || s.direction === +selectedSpec)
      .map(s => ({ id: s.doctor, name: s.doctor_name }))
      .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
    setDoctors(docs);
    setSelectedDoctor("");
    setSelectedWeekday("");
  }, [schedules, selectedSpec]);

  // Group schedules by doctor
  const scheduleMap = {};
  schedules.forEach(s => {
    if (selectedSpec && s.direction !== +selectedSpec) return;
    if (selectedDoctor && s.doctor !== +selectedDoctor) return;
    if (selectedWeekday && s.weekday !== +selectedWeekday) return;
    const id = s.doctor;
    if (!scheduleMap[id]) {
      scheduleMap[id] = {
        name: s.doctor_name,
        cabinet: s.cabinet,
        days: {},
        duration: s.appointment_duration,
        direction: s.direction,
      };
    }
    scheduleMap[id].days[s.weekday] = [s.start_time, s.end_time];
  });

  // Group by specialty
  const bySpec = {};
  Object.entries(scheduleMap).forEach(([docId, info]) => {
    const dirId = info.direction;
    if (!bySpec[dirId]) {
      const spec = specialties.find(sp => sp.id === dirId);
      bySpec[dirId] = { name: spec?.name || 'Без направления', doctors: [] };
    }
    bySpec[dirId].doctors.push({ id: docId, ...info });
  });

  // Week boundaries
  const today = new Date();
  const dow = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow - 1) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const closeModal = () => {
    setModalStep(0);
    setAvailableSlots([]);
    setBlockedSlots([]);
    setSelectedSlot("");
    setSelectedService("");
    setReason("");
  };

  const openSlots = (docId, docName, weekday, times, duration, direction) => {
    const dateObj = new Date(monday);
    dateObj.setDate(monday.getDate() + weekday - 1);
    setModalDoctorId(docId);
    setModalDoctorName(docName);
    setModalDateObj(dateObj);
    setModalDate(formatDate(dateObj));
    setModalDuration(duration);
    setModalDirection(direction);
    // slots generation and blocked fetch omitted for brevity...
    setModalStep(1);
  };

  // ... confirmAppointment and isPast as before

  return (
    <div className="schedule-wrapper">
      {/* controls ... */}

      <div className="schedule-grid">
        {Object.entries(bySpec).map(([specId, group]) => (
          <React.Fragment key={specId}>
            {/* Specialty header spanning all columns */}
            <div className="cell spec-header" style={{ gridColumn: '1 / -1' }}>{group.name}</div>
            {/* Column headers */}
            <div className="cell header">Врач</div>
            <div className="cell header">Кабинет</div>
            {weekdays.map(w => (
              <div key={w.value} className="cell header">
                {w.label}
                <div className="grid-date">
                  {formatDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+w.value-1))}
                </div>
              </div>
            ))}
            {/* Doctor rows */}
            {group.doctors.map(info => (
              <React.Fragment key={info.id}>
                <div className="cell">{info.name}</div>
                <div className="cell">{info.cabinet}</div>
                {weekdays.map(w => {
                  const times = info.days[w.value];
                  return (
                    <div
                      key={w.value}
                      className={`cell timeslot ${times ? 'active' : 'inactive'}`}
                      onClick={() => times && openSlots(
                        parseInt(info.id), info.name, w.value, times, info.duration, info.direction
                      )}
                    >
                      {times ? `${formatTime(times[0])}–${formatTime(times[1])}` : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* modal overlay ... */}
    </div>
  );
}
