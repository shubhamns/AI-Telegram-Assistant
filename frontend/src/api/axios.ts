import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
if (!baseURL && import.meta.env.MODE !== "test") {
  throw new Error("VITE_API_URL is missing. Create frontend/.env — see README.");
}
const api = axios.create({
  baseURL: baseURL || "http://127.0.0.1:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});
let refreshPromise: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  const { data } = await axios.post(`${baseURL || "http://127.0.0.1:5000/api/v1"}/auth/refresh`, { refreshToken });
  setStoredToken(data.data.token);
  setStoredRefreshToken(data.data.refreshToken);
  return data.data.token;
}
function clearSession() {
  setStoredToken(null);
  setStoredRefreshToken(null);
  if (window.location.pathname !== "/login") window.location.href = "/login";
}
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const message = err.response?.data?.message || err.message || "Request failed";
    const fields = err.response?.data?.fields as Record<string, string> | undefined;
    const isAuthRoute = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh") || original?.url?.includes("/auth/register") || original?.url?.includes("/auth/logout");
    if (err.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
        const token = await refreshPromise;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch { /* fall through */ }
      clearSession();
    }
    return Promise.reject(Object.assign(new Error(message), fields ? { fields } : {}));
  }
);
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function setStoredRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}
export function clearStoredTokens() {
  setStoredToken(null);
  setStoredRefreshToken(null);
}
export default api;
