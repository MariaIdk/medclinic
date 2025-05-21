// src/components/doctor_dashboard/DoctorSchedule.js
import React, { useEffect, useState, useContext } from "react";
import "../../../styles/AppointmentSchedule.css";
import { authFetch } from "../../../api";
import { AuthContext } from "../../../contexts/AuthContext";

const weekdays = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 7, label: "Вс" },
];

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}.${m}`;
}

export default function DoctorSchedule({ doctorId }) {
  const { accessToken } = useContext(AuthContext);

  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const dow = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow - 1) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [days, setDays] = useState({});
  const [blocked, setBlocked] = useState({});

  useEffect(() => {
    if (!doctorId) return;
    authFetch(
      `${process.env.REACT_APP_API_URL}/clinic-schedules/?doctor=${doctorId}`
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const map = {};
        data.forEach((s) => {
          const normalizeTime = (t) => t.slice(0, 5).padStart(5, "0");
          map[s.weekday] = {
            start: normalizeTime(s.start_time),
            end: normalizeTime(s.end_time),
            duration: s.appointment_duration,
            cabinet: s.cabinet,
          };
        });
        setDays(map);
      })
      .catch(console.error);
  }, [accessToken, doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    (async () => {
      const m = {};
      await Promise.all(
        weekdays.map(async ({ value }) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + value - 1);
          const iso = d.toISOString().slice(0, 10);
          const res = await authFetch(
            `${process.env.REACT_APP_API_URL}/appointments/` +
              `?doctor=${doctorId}&appointment_date=${iso}&status=scheduled`
          );
          const apps = res.ok ? await res.json() : [];
          m[value] = new Set(apps.map((a) => a.appointment_time.slice(0, 5)));
        })
      );
      setBlocked(m);
    })();
  }, [accessToken, doctorId, monday]);

  const generateTimeSlots = () => {
    const slots = [];
    
    Object.values(days).forEach(({ start, end, duration }) => {
      let [h, m] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      
      const startTotal = h * 60 + m;
      const endTotal = endH * 60 + endM;
      
      for (let time = startTotal; time < endTotal; time += duration) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const slot = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        if (!slots.includes(slot)) slots.push(slot);
      }
    });

    return slots.sort();
  };

  const slots = generateTimeSlots();

  return (
    <div className="schedule-wrapper">
      <div className="schedule-controls">
        <div className="week-selector">
          <button onClick={() => setWeekOffset((o) => o - 1)} disabled={weekOffset <= 0}>
            ‹
          </button>
          <span>
            Расписание с {formatDate(monday)} до {formatDate(sunday)}
          </span>
          <button onClick={() => setWeekOffset((o) => o + 1)}>›</button>
        </div>
      </div>

      <div
        className="schedule-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, 1fr)`,
        }}
      >
        {weekdays.map((w) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + w.value - 1);
          const info = days[w.value];
          return (
            <div key={w.value} className="cell header">
              <div className="weekday-label">{w.label}</div>
              <div className="grid-date">{formatDate(day)}</div>
              {info && <div className="cabinet">Каб. {info.cabinet}</div>}
            </div>
          );
        })}

        {slots.map((slot) => (
          <React.Fragment key={slot}>
            {weekdays.map((w) => {
              const info = days[w.value];
              if (!info) {
                return <div key={`${w.value}-${slot}`} className="cell inactive" />;
              }
              
              const [slotH, slotM] = slot.split(":").map(Number);
              const slotTotal = slotH * 60 + slotM;
              const [startH, startM] = info.start.split(":").map(Number);
              const [endH, endM] = info.end.split(":").map(Number);
              const startTotal = startH * 60 + startM;
              const endTotal = endH * 60 + endM;

              const isInRange = slotTotal >= startTotal && slotTotal < endTotal;
              const isBlocked = blocked[w.value]?.has(slot);

              return (
                <div
                  key={`${w.value}-${slot}`}
                  className={`cell timeslot ${
                    !isInRange ? "inactive" : isBlocked ? "blocked" : "active"
                  }`}
                  onClick={() => {
                    if (isInRange && !isBlocked) {
                      alert(`Выбрано ${slot}, ${w.label}`);
                    }
                  }}
                >
                  {isInRange && !isBlocked && (
                    <div className="slot-time">{slot}</div>
                  )}
                  {isBlocked && <div className="blocked-slot">{slot}</div>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}