import React, { useState, useEffect } from "react";

export default function AppointmentForm({ patientId }) {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");


    
  // 1. Получаем список услуг
  useEffect(() => {
    fetch("/api/services/")
      .then((res) => res.json())
      .then(setServices)
      .catch((err) => {
        console.error("Ошибка загрузки направлений", err);
      });
  }, []);

  // 2. Когда выбрано направление, подтягиваем всех врачей этой специальности
  useEffect(() => {
    if (!selectedService) return;
    fetch(`/api/doctors/?specialty=${encodeURIComponent(selectedService.direction)}`)
      .then((res) => res.json())
      .then(setDoctors)
      .catch(console.error);
  }, [selectedService]);

  // 3. Когда выбрали врача и дату — получаем расписание и формируем тайм-слоты
  useEffect(() => {
    if (!(selectedDoctor && selectedDate)) {
      setAvailableTimes([]);
      return;
    }
    // getDay(): 0(вс)...6; в API мы ожидаем 1..7
    const weekday = new Date(selectedDate).getDay() || 7;
    fetch(`/api/schedules/?doctor=${selectedDoctor.id}&weekday=${weekday}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.length) {
          setAvailableTimes([]);
          return;
        }
        const { start_time, end_time, appointment_duration } = data[0];
        const times = [];
        let [h, m] = start_time.split(":").map(Number);
        const [endH, endM] = end_time.split(":").map(Number);

        while (h < endH || (h === endH && m < endM)) {
          const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          times.push(t);
          m += appointment_duration;
          if (m >= 60) {
            h += Math.floor(m/60);
            m = m % 60;
          }
        }
        setAvailableTimes(times);
      })
      .catch(console.error);
  }, [selectedDoctor, selectedDate]);

  // 4. Отправка формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTime) {
      alert("Заполните все поля");
      return;
    }

    const payload = {
      patient: patientId,
      doctor: selectedDoctor.id,
      service: selectedService.id,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      reason,
    };

    fetch("/api/appointments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => {
        alert("Запись успешно создана!");
        // Можно сбросить форму:
        setSelectedService(null);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
        setReason("");
        setDoctors([]);
        setAvailableTimes([]);
      })
      .catch((err) => {
        console.error(err);
        alert("Не удалось создать запись");
      });
  };

  return (
    <div className="section">
      <h2>Запись к врачу</h2>
      <form onSubmit={handleSubmit} className="appointment-form">
        {/* 1. Направление */}
        <label>Направление:</label>
        <select
            value={selectedService?.id || ""}
            onChange={(e) => {
                const service = services.find(s => s.id === parseInt(e.target.value));
                setSelectedService(service);
                setSelectedDoctor(null);
                setSelectedDate("");
                setAvailableTimes([]);
            }}
            >
            <option value="">Выберите направление</option>
            {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>


        {/* 2. Врач */}
        {doctors.length > 0 && (
          <>
            <label>Врач:</label>
            <select
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
                const doc = doctors.find(d => d.id === +e.target.value);
                setSelectedDoctor(doc || null);
                setSelectedDate("");
                setAvailableTimes([]);
              }}
            >
              <option value="">— выберите врача —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.last_name} {d.first_name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 3. Дата */}
        {selectedDoctor && (
          <>
            <label>Дата приёма:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </>
        )}

        {/* 4. Время */}
        {availableTimes.length > 0 && (
          <>
            <label>Время:</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">— выберите время —</option>
              {availableTimes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </>
        )}

        {/* 5. Причина */}
        <label>Причина визита:</label>
        <textarea
          rows="3"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button type="submit">Записаться</button>
      </form>
    </div>
  );
}
