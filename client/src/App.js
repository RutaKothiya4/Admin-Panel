import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import NavbarTop from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import {
  LoginPage,
  RegisterPage,
  Home,
  AdminPage,
  ManagerPage,
  UserPage,
  NotFound,
} from "./pages";
import { refreshThunk } from "./features/auth/authThunks";
import Dashboard from "./pages/Dashboard";

function App() {
  const dispatch = useDispatch();

  // On mount, attempt silent token refresh if refreshToken exists
  useEffect(() => {
    if (localStorage.getItem("refreshToken")) {
      dispatch(refreshThunk());
    }
  }, [dispatch]);

  return (
    <>
      <NavbarTop />
      <Routes>
        {/* Redirect root to Home */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with role-based access control */}
         <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["Super Admin"]}>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <PrivateRoute roles={["Manager", "Super Admin"]}>
              <ManagerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute roles={["User", "Manager", "Super Admin"]}>
              <UserPage />
            </PrivateRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
