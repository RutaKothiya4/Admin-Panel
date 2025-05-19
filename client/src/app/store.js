import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

// Create Redux store with auth slice and customized middleware
const store = configureStore({
  reducer: {
    auth: authReducer, // handles authentication state
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false, // disables serializability check (useful for non-serializable data like Date or Errors)
    }),
});

export default store;
