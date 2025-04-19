import React, { useState, useEffect } from "react";
import AppointmentSchedule from "./AppointmentSchedule";

export default function AppointmentForm({ patientId }) {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);

  // Получаем список направлений
  useEffect(() => {
    fetch("http://localhost:8000/api/specialties/")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Services:", data);
        setServices(data);
        setLoadingServices(false);
      })
      .catch((err) => {
        console.error("❌ Ошибка загрузки направлений", err);
        setLoadingServices(false);
      });
  }, []);

  // Подгружаем врачей по направлению
  useEffect(() => {
    if (!selectedService) return;

    fetch(`/api/doctors/?specialty=${encodeURIComponent(selectedService.id)}`)
      .then((res) => res.json())
      .then(setDoctors)
      .catch(console.error);
  }, [selectedService]);

  // Получаем доступные временные слоты
  useEffect(() => {
    if (!(selectedDoctor && selectedDate)) {
      setAvailableTimes([]);
      return;
    }

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
            h += Math.floor(m / 60);
            m = m % 60;
          }
        }

        setAvailableTimes(times);
      })
      .catch(console.error);
  }, [selectedDoctor, selectedDate]);

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
      .then(() => {
        alert("Запись успешно создана!");
        setSelectedService(null);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
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

      {/* 1. Расписание врачей */}
      {!selectedService && <AppointmentSchedule />}

      <form onSubmit={handleSubmit} className="appointment-form">
        {/* 2. Выбор направления */}
        {loadingServices ? (
          <p>Загрузка направлений...</p>
        ) : (
          <>
            <label>Выберите направление:</label>
            <select
              value={selectedService?.id || ""}
              onChange={(e) => {
                const service = services.find((s) => s.id === +e.target.value);
                setSelectedService(service || null);
                setSelectedDoctor(null);
                setSelectedDate("");
                setAvailableTimes([]);
              }}
            >
              <option value="">— выбрать —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 3. Врач */}
        {selectedService && doctors.length > 0 && (
          <>
            <label>Выберите врача:</label>
            <select
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
                const doc = doctors.find((d) => d.id === +e.target.value);
                setSelectedDoctor(doc || null);
                setSelectedDate("");
                setAvailableTimes([]);
              }}
            >
              <option value="">— выбрать —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.last_name} {d.first_name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 4. Дата */}
        {selectedDoctor && (
          <>
            <label>Выберите дату:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </>
        )}

        {/* 5. Время */}
        {availableTimes.length > 0 && (
          <>
            <label>Выберите время:</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">— выбрать —</option>
              {availableTimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 6. Кнопка отправки */}
        {selectedTime && <button type="submit">Записаться</button>}
      </form>
    </div>
  );
}
