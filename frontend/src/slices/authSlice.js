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
  try { return JSON.parse(value); } catch { return null; }
};

const getSavedItem = (key) => {
  const item = localStorage.getItem(key);
  if (!item || item === "undefined" || item === "null") return null;
  return item;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: getSavedItem("token"),
    user: safeParse(getSavedItem("user")),
    role: getSavedItem("role"),
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      localStorage.clear();
      state.token = null;
      state.user = null;
      state.role = null;
    },
    //Action to update state when profile is edited
    updateUserInfo: (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; })
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

export const { logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;