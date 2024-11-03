import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  CurrentWeatherData,
  ForecastData,
  WeatherState,
  CoordinatesParams,
} from "../../types/weather";

// Initial state with separate sections for current and forecast data
const initialState: WeatherState = {
  current: {
    data: null,
    status: "idle",
  },
  forecast: {
    data: null,
    status: "idle",
  },
  error: null,
};

// Async thunk to fetch current weather data
export const fetchCurrentWeatherData = createAsyncThunk(
  "weather/fetchCurrentWeatherData",
  async (location: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<CurrentWeatherData>(
        `/weather/current?location=${encodeURIComponent(location)}`,
      );
      return response.data;
    } catch (error: any) {
      // Return a rejected value with the error message for better error handling
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

//http://localhost:5002/api/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America/New_York
// Async thunk to fetch forecast weather data
export const fetchLocationBasedForecastWeatherData = createAsyncThunk<
  ForecastData, // Return type
  CoordinatesParams, // Argument type
  { rejectValue: string } // Rejected value type
>(
  "weather/fetchLocationBasedForecastWeatherData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ForecastData>(
        `/weather/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&timezone=${encodeURIComponent(timezone)}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

// Weather slice managing both current and forecast data
const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchCurrentWeatherData
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
      });

    // Handle fetchLocationBasedForecastWeatherData
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
        },
      );
  },
});

export default weatherSlice.reducer;
