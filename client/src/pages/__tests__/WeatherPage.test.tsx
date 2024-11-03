import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import WeatherPage from "../WeatherPage";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { WeatherState } from "../../types/weather";
import weatherReducer from "../../redux/slices/weatherSlice";
import userReducer from "../../redux/slices/userSlice";
import favoritesReducer, {
  FavoritesState,
} from "../../redux/slices/favoritesSlice";
import errorReducer, { ErrorState } from "../../redux/slices/errorSlice";
import thunk from "redux-thunk";
import axiosInstance, { setStore } from "../../services/axiosInstance";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockAxios = new MockAdapter(axiosInstance);

interface MinimalRootState {
  user: { isAuthenticated: boolean; token?: string | null };
  weather: WeatherState;
  favorites: FavoritesState;
  error: ErrorState;
}

describe("WeatherPage", () => {
  let store: EnhancedStore<MinimalRootState>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        weather: weatherReducer,
        user: userReducer,
        favorites: favoritesReducer,
        error: errorReducer,
      },
      middleware: [thunk],
    });
    setStore(store as any);
    mockAxios.reset();
    jest.clearAllMocks();
  });

  const renderWithProviders = (
    ui: React.ReactElement,
    initialEntries: string[] = ["/weather/Los Angeles"],
  ) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/weather/:location" element={ui} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  it("displays loading state initially", async () => {
    mockAxios
      .onGet(/\/weather\/current\?location=Los%20Angeles/)
      .reply(() => new Promise(() => {}));
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(() => new Promise(() => {}));

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    expect(screen.getByText(/Loading weather data.../i)).toBeInTheDocument();
  });

  it("renders WeatherSummary and WeatherForecast after successful fetch", async () => {
    const currentWeatherData = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
    };

    const forecastData = {
      hourly: {
        time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
        temperature2m: {
          "0": 20.0,
          "1": 19.5,
        },
      },
    };

    mockAxios
      .onGet(/\/weather\/current\?location=Los%20Angeles/)
      .reply(200, currentWeatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(200, forecastData);

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(screen.getByText(/Weather in Los Angeles/i)).toBeInTheDocument();
  });

  it("dispatches setError and redirects on fetch failure", async () => {
    const errorMessage = "Error fetching weather data";

    mockAxios.onGet(/\/weather\/current\?location=Los%20Angeles/).reply(500, {
      message: errorMessage,
    });

    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(500, {
        message: errorMessage,
      });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.error.message).toBe(errorMessage);
    });

    await waitFor(() => {
      expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    });
  });

  it("shows save button when user is authenticated and location is not a favorite", async () => {
    const weatherData = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
    };

    const forecastData = {
      hourly: {
        time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
        temperature2m: {
          "0": 20.0,
          "1": 19.5,
        },
      },
    };

    mockAxios
      .onGet(/\/weather\/current\?location=Los%20Angeles/)
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, []);

    store = configureStore({
      reducer: {
        weather: weatherReducer,
        user: () => ({ isAuthenticated: true, token: "token123" }),
        favorites: favoritesReducer,
        error: errorReducer,
      },
      middleware: [thunk],
    });
    setStore(store as any);

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(
      screen.getByRole("button", { name: /\+ Favorite/i }),
    ).toBeInTheDocument();
  });

  it("does not show save button when user is not authenticated", async () => {
    const weatherData = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
    };

    const forecastData = {
      hourly: {
        time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
        temperature2m: {
          "0": 20.0,
          "1": 19.5,
        },
      },
    };

    mockAxios
      .onGet(/\/weather\/current\?location=Los%20Angeles/)
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, []);

    store = configureStore({
      reducer: {
        weather: weatherReducer,
        user: () => ({ isAuthenticated: false, token: null }),
        favorites: favoritesReducer,
        error: errorReducer,
      },
      middleware: [thunk],
    });
    setStore(store as any);

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(
      screen.queryByRole("button", { name: /\+ Favorite/i }),
    ).not.toBeInTheDocument();
  });

  it("dispatches saveFavorite action when Save as Favorite button is clicked", async () => {
    const currentWeatherData = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
    };

    const forecastData = {
      hourly: {
        time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
        temperature2m: {
          "0": 20.0,
          "1": 19.5,
        },
      },
    };

    const newFavorite = {
      _id: "fav123",
      user: "user123",
      location: "Los Angeles",
      date: "2024-10-30T12:00:00.000Z",
    };

    mockAxios
      .onGet(/\/weather\/current\?location=Los%20Angeles/)
      .reply(200, currentWeatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=42.8142&longitude=-73.9396&timezone=America%2FNew_York",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, []);
    mockAxios.onPost("/weather/favorites").reply(200, newFavorite);

    act(() => {
      store.dispatch({
        type: "user/loginSuccess",
        payload: {
          isAuthenticated: true,
          userInfo: {
            _id: "user123",
            name: "John Doe",
            email: "john.doe@example.com",
          },
          token: "test-token-abc123",
        },
      });
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    const saveButton = screen.getByRole("button", {
      name: /\+ Favorite/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.favorites.data).toContainEqual(newFavorite);
    });

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe("/weather/favorites");
  });
});
