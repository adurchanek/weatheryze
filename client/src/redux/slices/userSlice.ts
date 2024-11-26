import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const tokenFromStorage = localStorage.getItem("token");

interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

export interface UserState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
  loading: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
  userInfo: null,
  token: tokenFromStorage ? tokenFromStorage : null,
  loading: !!tokenFromStorage, // Start loading if token exists
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ userInfo: UserInfo; token: string }>,
    ) {
      state.isAuthenticated = true;
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token;
      state.loading = false; // Stop loading after login success
      localStorage.setItem("token", action.payload.token);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.token = null;
      state.loading = false; // Stop loading if logged out
      localStorage.removeItem("token");
    },
    loadUserStart(state) {
      state.loading = true; // Start loading when user load begins
    },
    loadUser(state, action: PayloadAction<UserInfo>) {
      state.isAuthenticated = true;
      state.userInfo = action.payload;
      state.loading = false; // Stop loading once user is loaded
    },
    loadUserFailure(state) {
      state.loading = false; // Stop loading on failure
    },
  },
});

export const {
  loginSuccess,
  logout,
  loadUserStart,
  loadUser,
  loadUserFailure,
} = userSlice.actions;

export default userSlice.reducer;
