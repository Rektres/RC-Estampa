import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = useAuthStore.getState().refresh;
      if (!refresh) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE}/auth/token/refresh/`, { refresh })
            .then((res) => res.data.access as string)
            .finally(() => { refreshPromise = null; });
        }
        const access = await refreshPromise;
        useAuthStore.getState().setAccess(access);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (e) {
        useAuthStore.getState().logout();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
