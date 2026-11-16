import { API_URL } from './constants';

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(`Cannot reach the backend at ${API_URL}. Start it, or set NEXT_PUBLIC_USE_DEMO=true.`, 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || 'Request failed (' + res.status + ')', res.status);
  return json;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  cardLogin: (cardId) => request('/api/auth/card', { method: 'POST', body: { cardId } }),
  bootstrap: (token) => request('/api/bootstrap', { token }),
  setIncidentStatus: (token, id, status) => request('/api/incidents/' + id, { method: 'PATCH', body: { status }, token })
};
