import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

// Protects routes based on login and role access
export default function PrivateRoute({ children, roles }) {
  const { accessToken, role } = useSelector((s) => s.auth);
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect if role is not allowed
  if (roles && !roles.includes(role)) {
    return <Navigate to="/Home" replace />;
  }

  // Access granted
  return children;
}
