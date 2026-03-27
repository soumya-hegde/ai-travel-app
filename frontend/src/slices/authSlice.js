import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      const response = await API.post("/login", data);

     const { token, user, role } = response.data;

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (role) localStorage.setItem("role", role);


      return { token, user, role };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || {});
    }
  }
);
const safeParse = (value) => {
  if (!value || value === "undefined") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    user: safeParse(localStorage.getItem("user")),
    role:
      localStorage.getItem("role") && localStorage.getItem("role") !== "undefined"
        ? localStorage.getItem("role")
        : null,
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      localStorage.clear(); // ✅ clean everything
      state.token = null;
      state.user = null;
      state.role = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;