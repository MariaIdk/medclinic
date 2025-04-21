// medclinic-frontend/src/components/api/index.js

// authFetch с автоматическим обновлением токена
export async function authFetch(url, opts = {}) {
  let token = localStorage.getItem('accessToken');

  let res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  // если токен истёк, пробуем обновить
  if (res.status === 401) {
    const refresh = localStorage.getItem('refreshToken');
    const refreshRes = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (refreshRes.ok) {
      const { access } = await refreshRes.json();
      localStorage.setItem('accessToken', access);

      // повторяем исходный запрос с новым токеном
      res = await fetch(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          Authorization: `Bearer ${access}`,
        },
      });
    }
  }

  return res;
}

export const getPatientDocuments = async (patientId) => {
  try {
    const res = await authFetch(`http://127.0.0.1:8000/api/patient-documents/?patient=${patientId}`);
    if (!res.ok) throw new Error('Ошибка при получении документов');
    return await res.json();
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    throw error;
  }
};

export const registerUser = async ({ username, password, firstName, lastName }) => {
  try {
    const res = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, first_name: firstName, last_name: lastName }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.username || errorData.password || 'Ошибка регистрации');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const loginUser = async ({ username, password }) => {
  try {
    const res = await fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Ошибка входа');
    }
    return await res.json(); // { access, refresh }
  } catch (err) {
    throw err;
  }
};
