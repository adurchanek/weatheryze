import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import weatherReducer from "./slices/weatherSlice";
import favoritesReducer from "./slices/favoritesSlice";
import errorReducer from "./slices/errorSlice";
import { setStore } from "../services/axiosInstance"; // Adjusted import path

export const store = configureStore({
  reducer: {
    user: userReducer,
    weather: weatherReducer,
    favorites: favoritesReducer,
    error: errorReducer,
  },
});

setStore(store); // Pass the store instance to axiosInstance

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
