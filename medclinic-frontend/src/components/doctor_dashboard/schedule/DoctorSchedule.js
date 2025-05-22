import React, { useState, useEffect, useContext } from 'react';
import { authFetch } from '../../../api';
import { AuthContext } from '../../../contexts/AuthContext';
import AppointmentModal from './AppointmentModal';
import '../../../styles/AppointmentSchedule.css';  // same file as patient

const weekdays = [1, 2, 3, 4, 5, 6, 7];
const weekdayLabels = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function formatDate(date) {
  const d = date.getDate().toString().padStart(2,'0');
  const m = (date.getMonth()+1).toString().padStart(2,'0');
  return `${d}.${m}`;
}

export default function DoctorSchedule({ doctorId }) {
  const { accessToken } = useContext(AuthContext);
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedules, setSchedules]   = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices]     = useState([]);
  const [modalData, setModalData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // compute monday/sunday
  const today = new Date();
  const dow   = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow-1) + weekOffset*7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // load schedules, appointments, services
  useEffect(() => {
    async function load() {
      try {
        const [sr, ar, svr] = await Promise.all([
          authFetch(`/api/clinic-schedules/?doctor=${doctorId}`),
          authFetch(`/api/appointments/?doctor=${doctorId}&status=all`),
          authFetch('/api/services/')
        ]);
        if (!sr.ok || !ar.ok || !svr.ok) throw new Error('Ошибка загрузки');
        const [sd, ad, sv] = await Promise.all([ sr.json(), ar.json(), svr.json() ]);
        setSchedules(sd);
        setAppointments(ad);
        setServices(sv);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }
    if (doctorId && accessToken) load();
  }, [doctorId, accessToken, weekOffset]);

  const getStatus = (date, time) => {
    const dt = new Date(`${date}T${time}`);
    const now = new Date();
    const isPast = dt < now;
    const appt = appointments.find(a => 
      a.appointment_date === date && a.appointment_time.startsWith(time)
    );
    return {
      isBooked: !!appt,
      isPast,
      isCompleted: appt?.status === 'completed',
      appointment: appt
    };
  };

  // build slots per day
  const slotsByDate = {};
  schedules.forEach(sch => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + (sch.weekday - 1));
    const key = d.toISOString().slice(0,10);
    let [h,m] = sch.start_time.split(':').map(Number);
    const [eH,eM] = sch.end_time.split(':').map(Number);
    const dur = sch.appointment_duration;
    while (h < eH || (h===eH && m<eM)) {
      const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      const st = getStatus(key, time);
      slotsByDate[key] = slotsByDate[key] || [];
      slotsByDate[key].push({
        time, cabinet: sch.cabinet,
        ...st, direction: sch.direction
      });
      m += dur;
      if (m>=60){ h+=Math.floor(m/60); m%=60; }
    }
  });

  if (loading) return <div className="schedule-wrapper">Загрузка...</div>;
  if (error)   return <div className="schedule-wrapper">Ошибка: {error}</div>;

  // find max rows
  const maxRows = Math.max(0, ...Object.values(slotsByDate).map(arr => arr.length));

  return (
    <div className="schedule-wrapper">
      <div className="schedule-controls">
        <div className="week-selector">
          <button onClick={()=>setWeekOffset(o=>o-1)} disabled={weekOffset===0}>‹</button>
          <span>Расписание с {formatDate(monday)} до {formatDate(sunday)}</span>
          <button onClick={()=>setWeekOffset(o=>o+1)}>›</button>
        </div>
      </div>

      <div className="schedule-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(7,1fr)`
      }}>
        {/* headers */}
        {weekdays.map((wd,i)=> {
          const d = new Date(monday);
          d.setDate(monday.getDate()+wd-1);
          const dk = d.toISOString().slice(0,10);
          const cab = slotsByDate[dk]?.[0]?.cabinet;
          return (
            <div key={wd} className="cell header">
              {weekdayLabels[i]}
              <div className="grid-date">{formatDate(d)}</div>
              {cab && <div className="grid-date">Каб. {cab}</div>}
            </div>
          );
        })}

        {/* slots */}
        {Array.from({length: maxRows}).map((_, row) =>
          weekdays.map((wd,i)=> {
            const d = new Date(monday);
            d.setDate(monday.getDate()+wd-1);
            const dk = d.toISOString().slice(0,10);
            const slot = slotsByDate[dk]?.[row];
            if (!slot) return <div key={`${dk}-${row}`} className="cell inactive"/>;
            const cls = [
              'cell','timeslot',
              slot.isPast
                ? slot.isBooked
                  ? '' // still keep booked style
                  : 'inactive'
                : slot.isBooked
                  ? 'booked'
                  : 'free'
            ].join(' ');
            return (
              <div key={`${dk}-${slot.time}`} className={cls}
                   onClick={()=>!slot.isPast && setModalData({
                     ...slot,date:dk,doctorId:doctorId
                   })}>
                {slot.time}
              </div>
            );
          })
        )}
      </div>

      {modalData && (
        <AppointmentModal
          slotData={modalData}
          services={services}
          onClose={()=>setModalData(null)}
        />
      )}
    </div>
  );
}
