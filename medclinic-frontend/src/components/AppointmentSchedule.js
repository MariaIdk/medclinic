import React from 'react';

const AppointmentSchedule = () => {
  // Пока статичные данные для примера
  const scheduleData = [
    {
      id: 1,
      doctorName: 'Иванов Иван Иванович', // фио1
      cabinet: 1,
      monday: '8:00-11:45',
      tuesday: '12:00-15:45',
      wednesday: '8:00-11:45',
      thursday: '12:00-15:45',
      friday: '8:00-11:45',
      saturday: '',
    },
    {
      id: 2,
      doctorName: 'Петров Пётр Петрович', // фио2
      cabinet: 2,
      monday: '12:00-15:45',
      tuesday: '8:00-11:45',
      wednesday: '12:00-15:45',
      thursday: '8:00-11:45',
      friday: '12:00-15:45',
      saturday: '',
    }
  ];

  return (
    <div>
      <h2>Расписание врачей</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#ececec' }}>
            <th>Врач</th>
            <th>Кабинет</th>
            <th>Пн</th>
            <th>Вт</th>
            <th>Ср</th>
            <th>Чт</th>
            <th>Пт</th>
            <th>Сб</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((row) => (
            <tr key={row.id}>
              <td>{row.doctorName}</td>
              <td>{row.cabinet}</td>
              <td>{row.monday}</td>
              <td>{row.tuesday}</td>
              <td>{row.wednesday}</td>
              <td>{row.thursday}</td>
              <td>{row.friday}</td>
              <td>{row.saturday}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentSchedule;
