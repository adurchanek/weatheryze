import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  ForecastData,
  PrecipitationData,
  WeatherState,
  CoordinatesParams,
  CurrentWeatherSummary,
  CurrentAirQualityData,
  WindSpeedData,
  WindData,
  DailyWeather,
  PrecipitationChanceData,
  ConditionData,
  TemperatureData,
} from "../../types/weather";
import { Location } from "../../types/location";

const initialState: WeatherState = {
  currentWeather: {
    data: null,
    status: "idle",
  },
  dailyWeather: {
    data: null,
    status: "idle",
  },
  forecast: {
    data: null,
    status: "idle",
  },
  precipitation: {
    data: null,
    status: "idle",
  },
  windSpeed: {
    data: null,
    status: "idle",
  },
  dailyWind: {
    data: null,
    status: "idle",
  },
  precipitationChanceData: {
    data: null,
    status: "idle",
  },
  temperatureData: {
    data: null,
    status: "idle",
  },
  conditionData: {
    data: null,
    status: "idle",
  },
  currentAirQuality: {
    data: null,
    status: "idle",
  },
  currentLocation: null,
  error: null,
};

export const fetchCurrentWeatherData = createAsyncThunk<
  CurrentWeatherSummary,
  CoordinatesParams & { location: string },
  { rejectValue: string }
>(
  "weather/fetchCurrentWeatherData",
  async ({ latitude, longitude, timezone, location }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<CurrentWeatherSummary>(
        `/v1/backend-service/weather/current?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&units=${encodeURIComponent(
          "imperial",
        )}&location=${encodeURIComponent(location)}`,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchCurrentAirQualityData = createAsyncThunk<
  CurrentAirQualityData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchCurrentAirQualityData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<CurrentAirQualityData>(
        `/v1/backend-service/weather/current-air-quality?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&units=${encodeURIComponent(
          "imperial",
        )}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchDailyWeatherData = createAsyncThunk<
  DailyWeather,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchDailyWeatherData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<DailyWeather>(
        `/v1/backend-service/weather/daily?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&units=imperial&forecast_days=1`,
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
  CoordinatesParams & { range: string },
  { rejectValue: string }
>(
  "weather/fetchLocationBasedForecastWeatherData",
  async ({ latitude, longitude, timezone, range }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ForecastData>(
        `/v1/backend-service/weather/forecast?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(
          timezone,
        )}&forecast_days=${encodeURIComponent(range)}`,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchLocationBasedWindSpeedWeatherData = createAsyncThunk<
  WindSpeedData,
  CoordinatesParams & { range: string },
  { rejectValue: string }
>(
  "weather/fetchLocationBasedWindSpeedWeatherData",
  async ({ latitude, longitude, timezone, range }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<WindSpeedData>(
        `/v1/backend-service/weather/windspeed?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(
          timezone,
        )}&forecast_days=${encodeURIComponent(range)}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchDailyWindData = createAsyncThunk<
  WindData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchDailyWindData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<WindData>(
        `/v1/backend-service/weather/wind?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&forecast_days=1`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchPrecipitationData = createAsyncThunk<
  PrecipitationData,
  CoordinatesParams & { range: string },
  { rejectValue: string }
>(
  "weather/fetchPrecipitationData",
  async ({ latitude, longitude, timezone, range }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PrecipitationData>(
        `/v1/backend-service/weather/precipitation?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&forecast_days=${encodeURIComponent(range)}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchDailyPrecipitationChanceData = createAsyncThunk<
  PrecipitationChanceData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchDailyPrecipitationChanceData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PrecipitationChanceData>(
        `/v1/backend-service/weather/precipitation-chance?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&forecast_days=1`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchDailyTemperatureData = createAsyncThunk<
  TemperatureData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchDailyTemperatureData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<TemperatureData>(
        `/v1/backend-service/weather/forecast?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&forecast_days=1`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

export const fetchDailyConditionData = createAsyncThunk<
  ConditionData,
  CoordinatesParams,
  { rejectValue: string }
>(
  "weather/fetchDailyConditionData",
  async ({ latitude, longitude, timezone }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ConditionData>(
        `/v1/backend-service/weather/condition?latitude=${encodeURIComponent(
          latitude,
        )}&longitude=${encodeURIComponent(
          longitude,
        )}&timezone=${encodeURIComponent(timezone)}&forecast_days=1`,
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
    clearWeatherData(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Current Weather Reducers
    builder
      .addCase(fetchCurrentWeatherData.pending, (state) => {
        state.currentWeather.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchCurrentWeatherData.fulfilled,
        (state, action: PayloadAction<CurrentWeatherSummary>) => {
          state.currentWeather.status = "succeeded";
          state.currentWeather.data = action.payload;
        },
      )
      .addCase(fetchCurrentWeatherData.rejected, (state, action) => {
        state.currentWeather.status = "failed";
        state.error = action.payload as string;
        state.currentWeather.data = null;
      });

    // Daily Weather Reducers
    builder
      .addCase(fetchDailyWeatherData.pending, (state) => {
        state.dailyWeather.status = "loading";
        state.error = null;
      })
      .addCase(fetchDailyWeatherData.fulfilled, (state, action) => {
        state.dailyWeather.status = "succeeded";
        state.dailyWeather.data = action.payload;
      })
      .addCase(fetchDailyWeatherData.rejected, (state, action) => {
        state.dailyWeather.status = "failed";
        state.error = action.payload as string;
      });

    // Current Air Quality Reducers
    builder
      .addCase(fetchCurrentAirQualityData.pending, (state) => {
        state.currentAirQuality.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchCurrentAirQualityData.fulfilled,
        (state, action: PayloadAction<CurrentAirQualityData>) => {
          state.currentAirQuality.status = "succeeded";
          state.currentAirQuality.data = action.payload;
        },
      )
      .addCase(fetchCurrentAirQualityData.rejected, (state, action) => {
        state.currentAirQuality.status = "failed";
        state.error = action.payload as string;
        state.currentAirQuality.data = null;
      });

    // Forecast Weather Reducers
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

    // Precipitation Data Reducers
    builder
      .addCase(fetchPrecipitationData.pending, (state) => {
        state.precipitation.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchPrecipitationData.fulfilled,
        (state, action: PayloadAction<PrecipitationData>) => {
          state.precipitation.status = "succeeded";
          state.precipitation.data = action.payload;
        },
      )
      .addCase(fetchPrecipitationData.rejected, (state, action) => {
        state.precipitation.status = "failed";
        state.error = action.payload as string;
        state.precipitation.data = null;
      });

    // Wind Data Reducers
    builder
      .addCase(fetchDailyWindData.pending, (state) => {
        state.dailyWind.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDailyWindData.fulfilled,
        (state, action: PayloadAction<WindData>) => {
          state.dailyWind.status = "succeeded";
          state.dailyWind.data = action.payload;
        },
      )
      .addCase(fetchDailyWindData.rejected, (state, action) => {
        state.dailyWind.status = "failed";
        state.error = action.payload as string;
        state.dailyWind.data = null;
      });

    // WindSpeed Weather Reducers
    builder
      .addCase(fetchLocationBasedWindSpeedWeatherData.pending, (state) => {
        state.windSpeed.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchLocationBasedWindSpeedWeatherData.fulfilled,
        (state, action: PayloadAction<WindSpeedData>) => {
          state.windSpeed.status = "succeeded";
          state.windSpeed.data = action.payload;
        },
      )
      .addCase(
        fetchLocationBasedWindSpeedWeatherData.rejected,
        (state, action) => {
          state.windSpeed.status = "failed";
          state.error = action.payload as string;
          state.windSpeed.data = null;
        },
      );

    // Precipitation Chance Data Reducers
    builder
      .addCase(fetchDailyPrecipitationChanceData.pending, (state) => {
        state.precipitationChanceData.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDailyPrecipitationChanceData.fulfilled,
        (state, action: PayloadAction<PrecipitationChanceData>) => {
          state.precipitationChanceData.status = "succeeded";
          state.precipitationChanceData.data = action.payload;
        },
      )
      .addCase(fetchDailyPrecipitationChanceData.rejected, (state, action) => {
        state.precipitationChanceData.status = "failed";
        state.error = action.payload as string;
        state.precipitationChanceData.data = null;
      });

    // Temperature Data Reducers
    builder
      .addCase(fetchDailyTemperatureData.pending, (state) => {
        state.temperatureData.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDailyTemperatureData.fulfilled,
        (state, action: PayloadAction<TemperatureData>) => {
          state.temperatureData.status = "succeeded";
          state.temperatureData.data = action.payload;
        },
      )
      .addCase(fetchDailyTemperatureData.rejected, (state, action) => {
        state.temperatureData.status = "failed";
        state.error = action.payload as string;
        state.temperatureData.data = null;
      });

    // Condition Data Reducers
    builder
      .addCase(fetchDailyConditionData.pending, (state) => {
        state.conditionData.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDailyConditionData.fulfilled,
        (state, action: PayloadAction<ConditionData>) => {
          state.conditionData.status = "succeeded";
          state.conditionData.data = action.payload;
        },
      )
      .addCase(fetchDailyConditionData.rejected, (state, action) => {
        state.conditionData.status = "failed";
        state.error = action.payload as string;
        state.conditionData.data = null;
      });
  },
});

export const { setCurrentLocation, clearWeatherError, clearWeatherData } =
  weatherSlice.actions;

export default weatherSlice.reducer;
