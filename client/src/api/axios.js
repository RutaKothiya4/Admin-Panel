import axios from "axios";
import store from "../app/store";
import { logout } from "../features/auth/authSlice";
import { refreshThunk } from "../features/auth/authThunks";

/* ---------- Axios instance ---------- */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // send cookies (refresh token) automatically
});

/* ---------- Request interceptor ---------- */
// Add the access token (if any) to every outgoing request
API.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- Response interceptor ---------- */
let refreshing = false; // guard to avoid parallel refresh calls
API.interceptors.response.use(
  (res) => res, // pass through successful responses
  async (error) => {
    const original = error.config;

    // If access token is expired (401) and we still have a refresh token:
    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem("refreshToken")
    ) {
      original._retry = true;
      if (!refreshing) {
        refreshing = true;
        try {
          // Attempt silent refresh
          await store.dispatch(refreshThunk()).unwrap();
          refreshing = false;
          return API(original); // retry original request
        } catch {
          refreshing = false;
          store.dispatch(logout()); // refresh failed → log out
        }
      }
    }

    return Promise.reject(error); // propagate other errors
  }
);

export default API;
