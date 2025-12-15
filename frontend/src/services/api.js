import axios from "axios";

// Create axios instance using environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Warn if env variable is missing (helps debugging)
if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    "⚠️ VITE_API_BASE_URL is not defined. Check .env or Vercel Environment Variables."
  );
}

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- AUTH ----------------

export async function login(email, password) {
  const res = await api.post("/auth/login-json", { email, password });
  localStorage.setItem("token", res.data.access_token);
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/users/me");
  return res.data;
}

// ---------------- RECYCLERS ----------------

export async function listCenters() {
  const res = await api.get("/recyclers/centers");
  return res.data;
}

export async function recyclerAssigned() {
  const res = await api.get("/recyclers/assigned");
  return res.data;
}

export async function recyclerUpdateStatus(reportId, status) {
  const res = await api.post(`/recyclers/assigned/${reportId}/status`, {
    status,
  });
  return res.data;
}

export async function claimCenter(centerId) {
  const res = await api.post(`/recyclers/centers/${centerId}/claim`);
  return res.data;
}

// ---------------- REPORTS ----------------

export async function createReport(file, recyclerId) {
  const form = new FormData();
  form.append("file", file);
  if (recyclerId) form.append("recycler_id", recyclerId);

  const res = await api.post("/reports/create", form);
  return res.data;
}

export async function userHistory() {
  const res = await api.get("/reports/history");
  return res.data;
}

// ---------------- ADMIN ----------------

export async function adminApproveCenter(centerId) {
  const res = await api.post(`/admin/centers/${centerId}/approve`);
  return res.data;
}

// ---------------- ANALYTICS ----------------

export async function analyticsOverview() {
  const res = await api.get("/analytics/overview");
  return res.data;
}

export async function getUserStats() {
  const res = await api.get("/users/stats");
  return res.data;
}

export default api;
