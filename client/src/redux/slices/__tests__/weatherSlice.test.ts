import weatherReducer, {
  fetchCurrentWeatherData,
  fetchLocationBasedForecastWeatherData,
  setCurrentLocation,
} from "../weatherSlice";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "../../../services/axiosInstance";
import {
  CurrentWeatherData,
  ForecastData,
  WeatherState,
} from "../../../types/weather";
import { Location } from "../../../types/location";

const mockAxios = new MockAdapter(axiosInstance);

describe("weatherSlice", () => {
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
      },
      status: "idle",
    },
    currentLocation: null,
    error: null,
  };

  let store: EnhancedStore<{ weather: WeatherState }, any>;

  beforeEach(() => {
    mockAxios.reset();
    store = configureStore({
      reducer: {
        weather: weatherReducer,
      },
    });
  });

  it("should return the initial state", () => {
    expect(weatherReducer(undefined, { type: undefined })).toEqual(
      initialState,
    );
  });

  it("handles setCurrentLocation", () => {
    const mockLocation: Location = {
      id: "NewYork-NY",
      name: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      country: "USA",
      countryCode: "US",
      state: "New York",
      stateCode: "NY",
      zip: "10001",
    };

    const action = setCurrentLocation(mockLocation);
    const state = weatherReducer(initialState, action);

    expect(state.currentLocation).toEqual(mockLocation);
  });

  it("handles fetchCurrentWeatherData pending", () => {
    const action = { type: fetchCurrentWeatherData.pending.type };
    const state = weatherReducer(initialState, action);
    expect(state.current.status).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("handles fetchCurrentWeatherData fulfilled", async () => {
    const currentWeatherData: CurrentWeatherData = {
      location: "New York",
      temperature: 25,
      humidity: 60,
      windSpeed: 10,
      condition: "Sunny",
    };

    mockAxios
      .onGet("/weather/current?location=New%20York")
      .reply(200, currentWeatherData);

    await store.dispatch(fetchCurrentWeatherData("New York") as any);

    const state = store.getState().weather;
    expect(state.current.status).toBe("succeeded");
    expect(state.current.data).toEqual(currentWeatherData);
    expect(state.error).toBeNull();
  });

  it("handles fetchCurrentWeatherData rejected", async () => {
    mockAxios.onGet("/weather/current?location=New%20York").reply(500, {
      message: "Internal Server Error",
    });

    await store.dispatch(fetchCurrentWeatherData("New York") as any);

    const state = store.getState().weather;
    expect(state.current.status).toBe("failed");
    expect(state.current.data).toEqual({
      location: "",
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      condition: "Unknown",
    });
    expect(state.error).toBe("Internal Server Error");
  });

  it("handles fetchLocationBasedForecastWeatherData pending", () => {
    const action = { type: fetchLocationBasedForecastWeatherData.pending.type };
    const state = weatherReducer(initialState, action);
    expect(state.forecast.status).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("handles fetchLocationBasedForecastWeatherData fulfilled", async () => {
    const forecastData: ForecastData = {
      hourly: {
        time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
        temperature2m: {
          "0": 12.04,
          "1": 12.34,
        },
      },
    };

    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=auto",
      )
      .reply(200, forecastData);

    await store.dispatch(
      fetchLocationBasedForecastWeatherData({
        latitude: 42.8142,
        longitude: -73.9396,
        timezone: "auto",
      }) as any,
    );

    const state = store.getState().weather;
    expect(state.forecast.status).toBe("succeeded");
    expect(state.forecast.data).toEqual(forecastData);
    expect(state.error).toBeNull();
  });

  it("handles fetchLocationBasedForecastWeatherData rejected", async () => {
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=auto",
      )
      .reply(404, {
        message: "Forecast data not found",
      });

    await store.dispatch(
      fetchLocationBasedForecastWeatherData({
        latitude: 42.8142,
        longitude: -73.9396,
        timezone: "auto",
      }) as any,
    );

    const state = store.getState().weather;
    expect(state.forecast.status).toBe("failed");
    expect(state.forecast.data).toEqual({
      hourly: {
        time: [],
        temperature2m: {},
      },
    });
    expect(state.error).toBe("Forecast data not found");
  });
});
