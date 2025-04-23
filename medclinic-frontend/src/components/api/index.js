// src/components/api/index.js

// —————————————————————————————————————————————————————————
// Универсальный fetch с подстановкой JWT и авто-рефрешем
// —————————————————————————————————————————————————————————
export async function authFetch(url, opts = {}) {
  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');

  const buildHeaders = (token) => {
    const headers = { ...(opts.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  let res = await fetch(url, {
    ...opts,
    headers: buildHeaders(access),
  });

  if (res.status === 401 && refresh) {
    const refreshRes = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (refreshRes.ok) {
      const { access: newAccess } = await refreshRes.json();
      localStorage.setItem('accessToken', newAccess);

      res = await fetch(url, {
        ...opts,
        headers: buildHeaders(newAccess),
      });
    } else {
      // refresh token недействителен — возможно, нужно разлогинить пользователя
      console.warn('Не удалось обновить токен. Пользователь должен авторизоваться заново.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  return res;
}


// —————————————————————————————————————————————————————————
// Получить документы пациента (только свои)
// —————————————————————————————————————————————————————————
export const getPatientDocuments = async (patientId) => {
  const res = await authFetch(
    `http://127.0.0.1:8000/api/patient-documents/?patient=${patientId}`
  );
  if (!res.ok) {
    throw new Error('Ошибка при получении документов');
  }
  return res.json();
};

// —————————————————————————————————————————————————————————
// Загрузка нового документа
// —————————————————————————————————————————————————————————
export const uploadPatientDocument = async ({ patientId, file, description }) => {
  const formData = new FormData();
  formData.append('patient', patientId);
  formData.append('document_file', file);
  formData.append('description', description);
  formData.append('uploaded_by', 'patient');

  const res = await authFetch('http://127.0.0.1:8000/api/patient-documents/', {
    method: 'POST',
    body: formData,
    headers: {} // Явно сбрасываем заголовки
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || JSON.stringify(errorData));
  }
  return res.json();
};

// —————————————————————————————————————————————————————————
// Удалить документ
// —————————————————————————————————————————————————————————
export const deletePatientDocument = async (docId) => {
  const res = await authFetch(`http://127.0.0.1:8000/api/patient-documents/${docId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Ошибка при удалении документа');
  }
  return true;
};

// —————————————————————————————————————————————————————————
// Регистрация нового пользователя‑пациента
// —————————————————————————————————————————————————————————
export const registerUser = async ({
  username,
  password,
  firstName,
  lastName,
  patronymic,
  dateOfBirth,
  email,
  phoneNumber,
  address
}) => {
  const body = {
    username,
    password,
    first_name: firstName,
    last_name: lastName,
    patronymic: patronymic || '',
    date_of_birth: dateOfBirth,
    email,
    phone_number: phoneNumber,
    address
  };

  const res = await fetch('http://localhost:8000/api/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const messages = Object.values(data).flat().join(' ');
    throw new Error(messages || 'Ошибка регистрации');
  }

  return data;
};

// —————————————————————————————————————————————————————————
// Вход (получение JWT)
// —————————————————————————————————————————————————————————
export const loginUser = async ({ username, password }) => {
  const res = await fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Ошибка входа');
  }

  // Сохраняем токены
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data;
};
