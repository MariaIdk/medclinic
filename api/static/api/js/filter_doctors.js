document.addEventListener('DOMContentLoaded', function () {
    const directionSelect = document.getElementById('id_direction');
    const doctorSelect = document.getElementById('id_doctor');

    if (directionSelect && doctorSelect) {
        directionSelect.addEventListener('change', function () {
            const specialtyId = this.value;

            fetch(`/api/ajax/get-doctors/?specialty_id=${specialtyId}`)
                .then(response => response.json())
                .then(data => {
                    doctorSelect.innerHTML = ''; // Очистим старые опции

                    data.forEach(doctor => {
                        const option = document.createElement('option');
                        option.value = doctor.id;
                        option.textContent = `${doctor.first_name} ${doctor.last_name}`;
                        doctorSelect.appendChild(option);
                    });
                });
        });
    }
});
