import axios from "axios";
import { useAuthStore } from "../stores/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Enviar cookie httpOnly del refresh token
});

// Adjuntar token de acceso a cada petición saliente
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

let isRefreshing = false;

// Renovar el token de acceso una sola vez ante un 401, luego reintentar la petición original
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await authStore.refresh();
        isRefreshing = false;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        authStore.clearSession();
      }
    }

    return Promise.reject(error);
  }
);