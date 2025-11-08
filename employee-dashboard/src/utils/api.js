export const apiFetch = async (endpoint, opts = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(endpoint, { ...opts, headers });
  if (res.status === 401) {
    localStorage.removeItem('token'); // optional
    // window.location.href = '/login'; // optional redirect
  }
  const json = await res.json().catch(() => null);
  return { res, json };
};