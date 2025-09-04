// Lightweight fetch-based client for the backend Startup routes
// Uses Vite's `import.meta.env.VITE_BACKEND_URL` when available.
// By default we use a relative base (empty string) so the frontend calls the backend on the
// same origin when the frontend is served by the backend. In dev you can set
// VITE_BACKEND_URL (for example `http://localhost:4000`) to override this.
const BASE_URL = import.meta.env?.VITE_BACKEND_URL ?? '';

function buildUrl(path) {
  // If BASE_URL is empty, return the path to perform a same-origin request.
  if (!BASE_URL) return path;
  // Trim trailing slash from BASE_URL to avoid double slashes when concatenating.
  return `${BASE_URL.replace(/\/$/, '')}${path}`;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const opts = { ...options, headers, credentials: options.credentials ?? 'include' };

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    if (!res.ok) {
      console.error('API error', res.status, data);
      throw { status: res.status, data };
    }

    return data;
  } catch (err) {
    console.error('Network/request error for', url, err);
    throw err;
  }
}

export const getAllStartups = () => request('/startup/get', { method: 'GET' });
export const getStartupById = (id) => request(`/startup/get/${encodeURIComponent(id)}`, { method: 'GET' });
export const createStartup = (payload, token) => request('/startup/create', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});
export const deleteStartup = (id, token) => request(`/startup/delete/${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

export default { getAllStartups, getStartupById, createStartup, deleteStartup };
