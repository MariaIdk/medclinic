// src/api/index.js

// Универсальный fetch с подстановкой JWT и авто-рефрешем
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
    const refreshRes = await fetch(
      `${process.env.REACT_APP_API_URL}/token/refresh/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      }
    );

    if (refreshRes.ok) {
      const { access: newAccess } = await refreshRes.json();
      localStorage.setItem('accessToken', newAccess);

      res = await fetch(url, {
        ...opts,
        headers: buildHeaders(newAccess),
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  return res;
}

// Документы пациента
export const getPatientDocuments = async (patientId) => {
  const res = await authFetch(
    `${process.env.REACT_APP_API_URL}/patient-documents/?patient=${patientId}`
  );
  if (!res.ok) throw new Error('Ошибка при получении документов');
  return res.json();
};

export const uploadPatientDocument = async ({ patientId, file, description }) => {
  const formData = new FormData();
  formData.append('patient', patientId);
  formData.append('document_file', file);
  formData.append('description', description);
  formData.append('uploaded_by', 'patient');

  const res = await authFetch(
    `${process.env.REACT_APP_API_URL}/patient-documents/`,
    { method: 'POST', body: formData, headers: {} }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || JSON.stringify(errorData));
  }
  return res.json();
};

export const deletePatientDocument = async (docId) => {
  const res = await authFetch(
    `${process.env.REACT_APP_API_URL}/patient-documents/${docId}/`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error('Ошибка при удалении документа');
  return true;
};

// Аутентификация и регистрация
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
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/register/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        patronymic: patronymic || '',
        date_of_birth: dateOfBirth,
        email,
        phone_number: phoneNumber,
        address
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = Object.values(data).flat().join(' ');
    throw new Error(msg || 'Ошибка регистрации');
  }
  return data;
};

export const loginUser = async ({ username, password }) => {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/token/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Ошибка входа');

  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data;
};
