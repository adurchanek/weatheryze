import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  CurrentWeatherData,
  ForecastData,
  WeatherState,
  CoordinatesParams,
} from "../../types/weather";
import { Location } from "../../types/location";

const initialState: WeatherState = {
  current: {
    data: null,
    status: "idle",
  },
  forecast: {
    data: null,
    status: "idle",
  },
  currentLocation: null,
  error: null,
};

// Fetch current weather data by location name
export const fetchCurrentWeatherData = createAsyncThunk(
  "weather/fetchCurrentWeatherData",
  async (location: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<CurrentWeatherData>(
        `/weather/current?location=${encodeURIComponent(location)}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

// Fetch forecast weather data based on coordinates
export const fetchLocationBasedForecastWeatherData = createAsyncThunk<
  ForecastData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchLocationBasedForecastWeatherData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ForecastData>(
        `/weather/forecast?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setCurrentLocation(state, action: PayloadAction<Location | null>) {
      state.currentLocation = action.payload;
    },
    clearWeatherError(state) {
      state.error = null;
    },
    clearData(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentWeatherData.pending, (state) => {
        state.current.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchCurrentWeatherData.fulfilled,
        (state, action: PayloadAction<CurrentWeatherData>) => {
          state.current.status = "succeeded";
          state.current.data = action.payload;
        },
      )
      .addCase(fetchCurrentWeatherData.rejected, (state, action) => {
        state.current.status = "failed";
        state.error = action.payload as string;
        state.current.data = null;
      });

    builder
      .addCase(fetchLocationBasedForecastWeatherData.pending, (state) => {
        state.forecast.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchLocationBasedForecastWeatherData.fulfilled,
        (state, action: PayloadAction<ForecastData>) => {
          state.forecast.status = "succeeded";
          state.forecast.data = action.payload;
        },
      )
      .addCase(
        fetchLocationBasedForecastWeatherData.rejected,
        (state, action) => {
          state.forecast.status = "failed";
          state.error = action.payload as string;
          state.forecast.data = null;
        },
      );
  },
});

export const { setCurrentLocation, clearWeatherError, clearData } =
  weatherSlice.actions;

export default weatherSlice.reducer;
