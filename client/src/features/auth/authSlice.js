import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  registerThunk,
  refreshThunk,
  logoutThunk,
} from "./authThunks";

// Load initial auth state from localStorage
const accessToken = localStorage.getItem("accessToken") || null;
const userRole = localStorage.getItem("userRole") || null;

const initialState = {
  accessToken,
  role: userRole,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Local logout: clear state and localStorage
    logout: (state) => {
      state.accessToken = null;
      state.role = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    // Common loading state
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    // Common error handler
    const rejected = (state, { payload }) => {
      state.loading = false;
      state.error = payload || "Something went wrong";
    };

    builder
      // Handle pending states
      .addCase(loginThunk.pending, pending)
      .addCase(registerThunk.pending, pending)
      .addCase(refreshThunk.pending, pending)
      .addCase(logoutThunk.pending, pending)

      // Handle fulfilled states
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.accessToken = payload.accessToken;
        state.role = payload.role;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.accessToken = payload.accessToken;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.role = null;
      })

      // Handle any rejected case
      .addMatcher((action) => action.type.endsWith("rejected"), rejected);
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
