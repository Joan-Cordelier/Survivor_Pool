const BASE_URL = import.meta.env?.VITE_BACKEND_URL ?? '';

function buildUrl(path) {
    // If BASE_URL is empty, return the path to perform a same-origin request.
    if (!BASE_URL) return path;
    // Trim trailing slash from BASE_URL to avoid double slashes when concatenating.
    return `${BASE_URL.replace(/\/$/, '')}${path}`;
}

class BaseBackApi {
    async request(path, options = {}) {
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
}

export default BaseBackApi;
