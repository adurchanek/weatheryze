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
    data: {
      location: "",
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      condition: "Unknown",
    },
    status: "idle",
  },
  forecast: {
    data: {
      hourly: {
        time: [],
        temperature2m: {},
      },
      utcOffsetSeconds: 0,
    },
    status: "idle",
  },
  currentLocation: null,
  error: null,
};

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

export const fetchLocationBasedForecastWeatherData = createAsyncThunk<
  ForecastData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchLocationBasedForecastWeatherData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ForecastData>(
        `/weather/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(
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
        state.current.data = {
          location: "",
          temperature: 0,
          humidity: 0,
          windSpeed: 0,
          condition: "Unknown",
        };
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
          state.forecast.data = {
            hourly: {
              time: [],
              temperature2m: {},
            },
            utcOffsetSeconds: 0,
          };
        },
      );
  },
});

export const { setCurrentLocation } = weatherSlice.actions;

export default weatherSlice.reducer;
