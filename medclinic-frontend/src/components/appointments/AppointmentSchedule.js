// AppointmentSchedule.js
import React, { useEffect, useState, useContext } from "react";
import "../../styles/AppointmentSchedule.css";
import { authFetch } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";

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

export default function AppointmentSchedule({ patientId }) {
  const { accessToken } = useContext(AuthContext);

  const [schedules, setSchedules]   = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices]     = useState([]);

  const [selectedSpec, setSelectedSpec]     = useState("");
  const [doctors, setDoctors]               = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState("");
  const [weekOffset, setWeekOffset]         = useState(0);

  const [modalStep, setModalStep]           = useState(0);
  const [modalDoctorId, setModalDoctorId]   = useState(null);
  const [modalDoctorName, setModalDoctorName] = useState("");
  const [modalDateObj, setModalDateObj]     = useState(null);
  const [modalDate, setModalDate]           = useState("");
  const [modalDuration, setModalDuration]   = useState(15);
  const [modalDirection, setModalDirection] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots]     = useState([]);
  const [selectedSlot, setSelectedSlot]     = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [reason, setReason]                 = useState("");

  // — загрузка расписаний, направлений и услуг
  useEffect(() => {
    authFetch("http://localhost:8000/api/clinic-schedules/")
      .then(res => res.ok ? res.json() : [])
      .then(setSchedules)
      .catch(console.error);

    authFetch("http://localhost:8000/api/specialties/")
      .then(res => res.ok ? res.json() : [])
      .then(setSpecialties)
      .catch(console.error);

    authFetch("http://localhost:8000/api/services/")
      .then(res => res.ok ? res.json() : [])
      .then(setServices)
      .catch(console.error);
  }, [accessToken]);

  // — фильтрация списка врачей по выбранному направлению
  useEffect(() => {
    const docs = schedules
      .filter(s => !selectedSpec || s.direction === +selectedSpec)
      .map(s => ({ id: s.doctor, name: s.doctor_name }))
      .filter((v,i,a) => a.findIndex(x => x.id===v.id)===i);
    setDoctors(docs);
    setSelectedDoctor("");
    setSelectedWeekday("");
  }, [schedules, selectedSpec]);

  // — группировка расписаний для сетки
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
        direction: s.direction
      };
    }
    scheduleMap[id].days[s.weekday] = [s.start_time, s.end_time];
  });

  const bySpec = {};
  Object.entries(scheduleMap).forEach(([docId, info]) => {
    const dir = info.direction;
    if (!bySpec[dir]) {
      const spec = specialties.find(sp => sp.id === dir);
      bySpec[dir] = { name: spec?.name || 'Без направления', doctors: [] };
    }
    bySpec[dir].doctors.push({ id: docId, ...info });
  });

  // — вычисляем понедельник и воскресенье текущей недели с учётом offset
  const today = new Date();
  const dow   = today.getDay() || 7;
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
    // вычисляем дату приёма
    const dateObj = new Date(monday);
    dateObj.setDate(monday.getDate() + weekday - 1);
    const isoDate = dateObj.toISOString().slice(0,10);

    setModalDoctorId(docId);
    setModalDoctorName(docName);
    setModalDateObj(dateObj);
    setModalDate(formatDate(dateObj));
    setModalDuration(duration);
    setModalDirection(direction);

    // генерируем слоты
    const [start, end] = times;
    let [h, m] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const slots = [];
    while (h < endH || (h===endH && m<endM)) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      m += duration;
      if (m >= 60) { h += Math.floor(m/60); m %= 60; }
    }
    setAvailableSlots(slots);

    // блокируем занятые слоты у доктора и пациента
    Promise.all([
      authFetch(`http://localhost:8000/api/appointments/?doctor=${docId}&appointment_date=${isoDate}&status=scheduled`)
        .then(r=> r.ok ? r.json() : []),
      authFetch(`http://localhost:8000/api/appointments/?patient=${patientId}&appointment_date=${isoDate}&status=scheduled`)
        .then(r=> r.ok ? r.json() : [])
    ]).then(([docApps, patApps]) => {
      const docTimes = Array.isArray(docApps) ? docApps.map(a=>a.appointment_time.slice(0,5)) : [];
      const patTimes = Array.isArray(patApps) ? patApps.map(a=>a.appointment_time.slice(0,5)) : [];
      setBlockedSlots([...new Set([...docTimes, ...patTimes])]);
    }).catch(console.error);

    setModalStep(1);
  };

  const confirmAppointment = () => {
    const [d,m,y] = modalDate.split('.');
    const payload = {
      patient: patientId,
      doctor: modalDoctorId,
      service: selectedService,
      appointment_date: `20${y}-${m}-${d}`,
      appointment_time: selectedSlot,
      reason
    };
    authFetch("http://localhost:8000/api/appointments/", {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) return res.json().then(err=>{throw new Error(err.detail||"Ошибка")});
      alert("Запись прошла успешно");
      closeModal();
    })
    .catch(console.error);
  };

  const isPast = slot => {
    if (!modalDateObj) return false;
    const [h,m] = slot.split(':').map(Number);
    const dt = new Date(modalDateObj);
    dt.setHours(h,m,0,0);
    return dt < new Date();
  };

  return (
    <div className="schedule-wrapper">
      {/* week selector */}
      <div className="schedule-controls">
        <div className="week-selector">
          <button onClick={()=>setWeekOffset(o=>o-1)} disabled={weekOffset===0}>‹</button>
          <span>Расписание с {formatDate(monday)} до {formatDate(sunday)}</span>
          <button onClick={()=>setWeekOffset(o=>o+1)} disabled={weekOffset===5}>›</button>
        </div>
        <div className="filters">
          <label>Направление:</label>
          <select value={selectedSpec} onChange={e=>setSelectedSpec(e.target.value)}>
            <option value="">Все</option>
            {specialties.map(sp=>(
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
          <label>Врач:</label>
          <select value={selectedDoctor} onChange={e=>setSelectedDoctor(e.target.value)}>
            <option value="">Все</option>
            {doctors.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <label>День:</label>
          <select value={selectedWeekday} onChange={e=>setSelectedWeekday(e.target.value)}>
            <option value="">Все</option>
            {weekdays.map(w=>(
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* grid */}
      <div className="schedule-grid">
        {Object.entries(bySpec).map(([specId, grp])=>(
          <React.Fragment key={specId}>
            <div className="cell spec-header" style={{gridColumn:'1 / -1'}}>{grp.name}</div>
            <div className="cell header">Врач</div>
            <div className="cell header">Кабинет</div>
            {weekdays.map(w=>(
              <div key={w.value} className="cell header">
                {w.label}
                <div className="grid-date">
                  {formatDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+w.value-1))}
                </div>
              </div>
            ))}
            {grp.doctors.map(info=>(
              <React.Fragment key={info.id}>
                <div className="cell">{info.name}</div>
                <div className="cell">{info.cabinet}</div>
                {weekdays.map(w=>(
                  <div
                    key={w.value}
                    className={`cell timeslot ${info.days[w.value]?'active':'inactive'}`}
                    onClick={()=>info.days[w.value] && openSlots(
                      info.id, info.name, w.value, info.days[w.value], info.duration, info.direction
                    )}
                  >
                    {info.days[w.value]
                      ? `${formatTime(info.days[w.value][0])}–${formatTime(info.days[w.value][1])}`
                      : ''
                    }
                  </div>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* modal */}
      {modalStep>0 && (
        <div className="modal-overlay">
          <div className="modal-window">
            <button className="modal-close" onClick={closeModal}>×</button>
            {modalStep===1 ? (
              <>
                <h3>{modalDoctorName}, {modalDate}</h3>
                <div className="slots-list">
                  {availableSlots.map(s=>(
                    <button
                      key={s}
                      className={`slot-btn ${blockedSlots.includes(s)?'blocked':''} ${selectedSlot===s?'selected':''}`}
                      disabled={blockedSlots.includes(s)||isPast(s)}
                      onClick={()=>setSelectedSlot(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {selectedSlot && (
                  <button className="modal-next" onClick={()=>setModalStep(2)}>
                    Выбрать время
                  </button>
                )}
              </>
            ) : (
              <>
                <h3>{modalDoctorName}, {modalDate}, {selectedSlot}</h3>
                <label>Услуга:</label>
                <select value={selectedService} onChange={e=>setSelectedService(e.target.value)}>
                  <option value="">— выбрать —</option>
                  {services.filter(s=>s.direction===modalDirection).map(s=>(
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <label>Причина обращения:</label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} />
                {selectedService && reason && (
                  <button className="modal-confirm" onClick={confirmAppointment}>
                    Записаться
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
