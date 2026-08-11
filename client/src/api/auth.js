const BASE = '/auth';

async function request(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    throw new Error(`Server returned an invalid response (${res.status})`);
  }

  if (!res.ok) {
    const err = new Error(data?.error?.message || `Request failed with status ${res.status}`);
    err.field  = data?.error?.field;
    err.status = res.status;
    throw err;
  }

  return data;
}

export function login(email, password) {
  return request(`${BASE}/login`, { email, password });
}

export function register(name, email, password) {
  return request(`${BASE}/register`, { name, email, password });
}

export async function getMe(token) {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session invalid');
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
