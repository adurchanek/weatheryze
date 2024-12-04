import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import WeatherPage from "../WeatherPage";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { WeatherState } from "../../types/weather";
import weatherReducer, {
  setCurrentLocation,
} from "../../redux/slices/weatherSlice";
import userReducer from "../../redux/slices/userSlice";
import favoritesReducer from "../../redux/slices/favoritesSlice";
import errorReducer from "../../redux/slices/errorSlice";
import thunk from "redux-thunk";
import axiosInstance, { setStore } from "../../services/axiosInstance";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ErrorState } from "../../types/error";
import { FavoriteLocation, FavoritesState } from "../../types/favorites";
import { Location } from "../../types/location";

const mockAxios = new MockAdapter(axiosInstance);

interface MinimalRootState {
  user: { isAuthenticated: boolean; token?: string | null };
  weather: WeatherState;
  favorites: FavoritesState;
  error: ErrorState;
}

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
  utcOffsetSeconds: -18000,
};

jest.mock("../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

describe("WeatherPage", () => {
  let store: EnhancedStore<MinimalRootState>;

  const mockLocation: Location = {
    id: "LosAngeles-CA",
    name: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    country: "USA",
    countryCode: "US",
    state: "California",
    stateCode: "CA",
    zip: "90001",
  };

  const newFavorite: FavoriteLocation = {
    _id: "3",
    user: "user1",
    latitude: 40.7128,
    longitude: -74.006,
    name: "New York",
    date: "2023-10-03",
    id: "40.7128,-74.006",
    country: "United States",
    countryCode: "US",
    state: "New York",
    stateCode: "NY",
    zip: null,
  };

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
    initialEntries: string[] = ["/weather/34.0522,-118.2437"],
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

  it("displays skeleton loaders initially", async () => {
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(() => new Promise(() => {}));
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(() => new Promise(() => {}));

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    const skeletons = screen.getAllByRole("status");
    expect(skeletons).toHaveLength(3);
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
      utcOffsetSeconds: -18000,
    };

    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, currentWeatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, forecastData);

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
  });

  it("dispatches setError and redirects on fetch failure", async () => {
    const errorMessage = "Error fetching weather data";

    mockAxios.onGet("/weather/current?location=Los%20Angeles").reply(500, {
      message: errorMessage,
    });

    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(500, {
        message: errorMessage,
      });

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
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
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
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

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(
      screen.getByRole("button", { name: /Add to Favorites/i }),
    ).toBeInTheDocument();
  });

  it("does not show save button when user is not authenticated", async () => {
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
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

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

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

  it("dispatches saveFavorite action and sends a POST request when Save as Favorite button is clicked", async () => {
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
      utcOffsetSeconds: -18000,
    };

    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, currentWeatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, []);
    mockAxios.onPost("/weather/favorites").reply(200, newFavorite);

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

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
      name: /Add to Favorites/i,
    });
    fireEvent.click(saveButton);

    // Check that the thunk dispatched correctly and updated state
    await waitFor(() => {
      const state = store.getState();
      expect(state.favorites.data).toContainEqual(newFavorite);
    });

    // Verify the POST request was made with correct data
    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe("/weather/favorites");
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({
      location: {
        country: "USA",
        countryCode: "US",
        id: "LosAngeles-CA",
        latitude: 34.0522,
        longitude: -118.2437,
        name: "Los Angeles",
        state: "California",
        stateCode: "CA",
        zip: "90001",
      },
    });
  });

  it("redirects to Home when fetchLocationByCoordinates fails", async () => {
    mockAxios
      .onGet("/location/coordinates?latitude=34.0522&longitude=-118.2437")
      .reply(500, { message: "Failed to fetch location by coordinates." });

    // Render the WeatherPage component
    await act(async () => {
      renderWithProviders(<WeatherPage />, ["/weather/34.0522,-118.2437"]);
    });

    // Verify that the user is redirected to Home
    await waitFor(() => {
      expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    });

    // Verify that the error message was set correctly in the Redux state
    const state = store.getState();
    expect(state.error.message).toBe(
      "Failed to fetch location by coordinates.",
    );
  });

  it("fetches weather data after successful fetchLocationByCoordinates", async () => {
    const locationData = {
      id: "LosAngeles-CA",
      name: "Los Angeles",
      latitude: 34.0522,
      longitude: -118.2437,
      country: "USA",
      countryCode: "US",
      state: "California",
      stateCode: "CA",
      zip: "90001",
    };

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
      utcOffsetSeconds: -18000,
    };

    mockAxios
      .onGet("/location/coordinates?latitude=34.0522&longitude=-118.2437")
      .reply(200, locationData);
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, currentWeatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, forecastData);

    await act(async () => {
      renderWithProviders(<WeatherPage />, ["/weather/34.0522,-118.2437"]);
    });

    await waitFor(() =>
      expect(screen.getByLabelText("weather-summary")).toBeInTheDocument(),
    );

    expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    expect(store.getState().weather.currentLocation).toEqual(locationData);
    expect(store.getState().weather.current.data).toEqual(currentWeatherData);
    expect(store.getState().weather.forecast.data).toEqual(forecastData);
  });

  it("handles favorites fetch failure gracefully", async () => {
    mockAxios
      .onGet("/weather/favorites")
      .reply(500, { message: "Error fetching favorites" });

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
      renderWithProviders(<WeatherPage />, ["/weather/34.0522,-118.2437"]);
    });

    const state = store.getState();
    expect(state.error.message).toBe("Error fetching favorites");
  });

  it("redirects to Home when weather fetch fails", async () => {
    const locationData = {
      id: "LosAngeles-CA",
      name: "Los Angeles",
      latitude: 34.0522,
      longitude: -118.2437,
      country: "USA",
      countryCode: "US",
      state: "California",
      stateCode: "CA",
      zip: "90001",
    };

    mockAxios
      .onGet("/location/coordinates?latitude=34.0522&longitude=-118.2437")
      .reply(200, locationData);
    mockAxios.onGet("/weather/current?location=Los%20Angeles").reply(500, {
      message: "Error fetching weather data",
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />, ["/weather/34.0522,-118.2437"]);
    });

    await waitFor(() => {
      expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.error.message).toBe("Error fetching weather data");
  });

  it("does not fetch additional data if coordinates are unchanged", async () => {
    const locationData = {
      id: "LosAngeles-CA",
      name: "Los Angeles",
      latitude: 34.0522,
      longitude: -118.2437,
      country: "USA",
      countryCode: "US",
      state: "California",
      stateCode: "CA",
      zip: "90001",
    };

    act(() => {
      store.dispatch(setCurrentLocation(locationData));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />, ["/weather/34.0522,-118.2437"]);
    });

    expect(mockAxios.history.get.length).toBe(2); // One for current weather, one for forecast

    const fetchCurrentWeatherCall = mockAxios.history.get.find((call) =>
      call?.url?.includes(`/weather/current`),
    );
    const fetchForecastCall = mockAxios.history.get.find((call) =>
      call?.url?.includes(`/weather/forecast`),
    );
    expect(fetchCurrentWeatherCall).toBeTruthy();
    expect(fetchForecastCall).toBeTruthy();
  });

  it("displays skeleton loaders only for loading sections", async () => {
    // Mock API calls to simulate pending states
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(() => new Promise(() => {})); // Keeps promise pending
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(() => new Promise(() => {})); // Keeps promise pending
    mockAxios.onGet("/weather/favorites").reply(() => new Promise(() => {})); // Keeps promise pending

    // Mock authenticated user state
    act(() => {
      store.dispatch({
        type: "user/loginSuccess",
        payload: {
          userInfo: { name: "Test User" },
          token: "test-token",
        },
      });
    });

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    // Verify that skeleton loaders exist for the weather summary and forecast sections
    const skeletons = screen.getAllByRole("status");
    expect(skeletons).toHaveLength(3); // Two forecast loaders and one summary loader

    // Ensure the favorite button does not render during loading
    expect(
      screen.queryByRole("button", { name: /\+ Favorite/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render weather summary or forecast if weather data is empty", async () => {
    mockAxios.onGet("/weather/current?location=Los%20Angeles").reply(200, null); // Simulate empty data
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, null);

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() =>
      expect(
        screen.queryByLabelText("weather-summary"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText(/Los Angeles/i)).not.toBeInTheDocument();
  });

  it("updates isFavorite state when location is added to favorites", async () => {
    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, []);
    mockAxios.onPost("/weather/favorites").reply(200, newFavorite);

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

    act(() => {
      store.dispatch({
        type: "user/loginSuccess",
        payload: { isAuthenticated: true, token: "test-token-abc123" },
      });
    });

    await act(async () => {
      renderWithProviders(<WeatherPage />);
    });

    await waitFor(() => {
      const addButton = screen.getByRole("button", {
        name: /Add to Favorites/i,
      });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Add to Favorites/i }),
      ).not.toBeInTheDocument();
    });

    // Ensure the button now shows "Remove from Favorites"
    expect(
      screen.getByRole("button", { name: /Remove from Favorites/i }),
    ).toBeInTheDocument();

    // Verify state
    const state = store.getState();
    expect(state.favorites.data).toContainEqual(newFavorite);
  });

  it("redirects to Home when location URL is invalid", async () => {
    await act(async () => {
      renderWithProviders(<WeatherPage />, ["/weather/invalid-location"]);
    });

    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });

  it("disables save button for favorite locations on revisit", async () => {
    const existingFavorite: FavoriteLocation = newFavorite;

    mockAxios
      .onGet("/weather/current?location=Los%20Angeles")
      .reply(200, weatherData);
    mockAxios
      .onGet(
        "/weather/forecast?latitude=34.0522&longitude=-118.2437&timezone=auto",
      )
      .reply(200, forecastData);
    mockAxios.onGet("/weather/favorites").reply(200, [existingFavorite]);

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

    act(() => {
      store.dispatch(setCurrentLocation(mockLocation));
    });

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
});
