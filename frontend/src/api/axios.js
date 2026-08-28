import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;
      originalRequest._retry = true;

      localStorage.removeItem("token");

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/signup") &&
        !window.location.pathname.includes("/verify-otp") &&
        !window.location.pathname.includes("/admin-login")
      ) {
        window.location.href = "/login";
      }

      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);

export default API;
