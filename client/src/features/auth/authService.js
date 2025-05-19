import API from "../../api/axios";

// Register user (no return data expected)
const register = async (formData) => {
  await API.post("/auth/register", formData);
};

// Login user and persist tokens + role
const login = async (formData) => {
  const res = await API.post("/auth/login", formData);
  const { accessToken, refreshToken, sessionId } = res.data;

  // Store tokens/session in localStorage
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("sessionId", sessionId);

  // Extract role from JWT (base64 decode only, not secure)
  const [, payload] = accessToken.split(".");
  const { role } = JSON.parse(atob(payload));
  localStorage.setItem("userRole", role);

  return { accessToken, role };
};

// Refresh access token using refresh token and session ID
const refresh = async () => {
  const res = await API.post("/auth/refresh", {
    refreshToken: localStorage.getItem("refreshToken"),
    sessionId: localStorage.getItem("sessionId"),
    ipAddress: "::1", // Typically populated by server via req.ip
    userAgent: navigator.userAgent,
  });

  const { accessToken } = res.data;
  localStorage.setItem("accessToken", accessToken);
  return { accessToken };
};

// Logout user and clear local storage
const logout = async () => {
  await API.post("/auth/logout", {
    refreshToken: localStorage.getItem("refreshToken"),
    sessionId: localStorage.getItem("sessionId"),
  });
  localStorage.clear(); // remove all stored tokens/session
};

const authService = { register, login, refresh, logout };
export default authService;
