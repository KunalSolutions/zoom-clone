import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  admin: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
    },

    logout: (state) => {
      state.token = null;
      state.admin = null;
    },
  },
});

export const {
  setCredentials,
  logout,
} = authSlice.actions;

export default authSlice.reducer;