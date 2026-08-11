const BASE = '/projects';

// Token accessor — set by auth state in App.jsx
let _token = null;
export function setAuthToken(token) { _token = token; }

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(
      data?.error?.message || `Request failed with status ${res.status}`
    );
    err.field  = data?.error?.field;
    err.status = res.status;
    throw err;
  }

  return data;
}

export function getProjects(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`${BASE}${qs ? `?${qs}` : ''}`);
}

export function getProjectStats() {
  return request(`${BASE}/stats`);
}

export function getProject(id) {
  return request(`${BASE}/${id}`);
}

export function createProject(data) {
  return request(BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProject(id, data) {
  return request(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProject(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}
