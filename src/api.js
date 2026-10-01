import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const baseURL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({ baseURL });

// attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

// get a readable error message from the backend JSON
export const errMsg = (e) => e.response?.data?.error || "Server error / backend not running";

export default api;
