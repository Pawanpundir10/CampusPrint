import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("cp_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
API.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("cp_token");
      localStorage.removeItem("cp_user");
      window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);
export default API;
