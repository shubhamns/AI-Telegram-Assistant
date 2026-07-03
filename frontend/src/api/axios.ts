import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL && import.meta.env.MODE !== "test") {
  throw new Error("VITE_API_URL is missing. Create frontend/.env — see README.");
}
const api = axios.create({
  baseURL: baseURL || "http://127.0.0.1:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);
export default api;
