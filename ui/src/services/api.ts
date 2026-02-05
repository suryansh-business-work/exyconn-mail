import axios from "axios";

const API_BASE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:4032/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
