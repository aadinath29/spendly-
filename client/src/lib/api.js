import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the stale session and send the user back to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

/** Pull a human-friendly message out of an axios error. */
export const getApiError = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
