import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import FavoritesPage from "../FavoritesPage";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../redux/slices/favoritesSlice";
import userReducer from "../../redux/slices/userSlice";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import thunk from "redux-thunk";
import axiosInstance from "../../services/axiosInstance";
import MockAdapter from "axios-mock-adapter";
import { FavoriteLocation, FavoritesState } from "../../types/favorites";

const mockAxios = new MockAdapter(axiosInstance);

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

interface MinimalRootState {
  user: { isAuthenticated: boolean; token?: string | null };
  favorites: FavoritesState;
}

jest.mock("../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

describe("FavoritesPage", () => {
  let store: EnhancedStore<MinimalRootState>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        favorites: favoritesReducer,
        user: userReducer,
      },
      middleware: [thunk],
    });
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it("displays message when no favorite locations are saved", async () => {
    mockAxios.onGet("/weather/favorites").reply(200, []);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No favorite locations saved/i),
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("displays favorite locations after successful fetch", async () => {
    const favorites = [
      { _id: "1", user: "user1", name: "New York", date: "2023-10-01" },
      { _id: "2", user: "user1", name: "Los Angeles", date: "2023-10-02" },
    ];

    mockAxios.onGet("/weather/favorites").reply(200, favorites);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Favorites/i)).toBeInTheDocument();
      expect(screen.getByText(/New York/i)).toBeInTheDocument();
      expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    });
  });

  it("displays error message on fetch failure", async () => {
    mockAxios.onGet("/weather/favorites").reply(500);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Error loading favorites/i)).toBeInTheDocument();
    });
  });

  it("deletes a favorite location on delete button click", async () => {
    const favorites = [
      { _id: "1", user: "user1", name: "New York", date: "2023-10-01" },
      { _id: "2", user: "user1", name: "Los Angeles", date: "2023-10-02" },
    ];

    mockAxios.onGet("/weather/favorites").reply(200, favorites);
    mockAxios.onDelete("/weather/favorites/1").reply(200);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/New York/i)).toBeInTheDocument();
      expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    });

    const removeFavoriteButtons = screen.getAllByRole("button", {
      name: /Remove Favorite/i,
    });
    expect(removeFavoriteButtons.length).toBe(2); // Ensure there are two buttons

    fireEvent.click(removeFavoriteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/New York/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    });
  });

  it("navigates to weather page when 'View' button is clicked", async () => {
    const favorites: FavoriteLocation[] = [
      {
        _id: "1",
        user: "user1",
        name: "New York",
        date: "2023-10-01",
        latitude: 40.7128,
        longitude: -74.006,
        id: "40.7128,-74.006",
        country: "United States",
        countryCode: "US",
        state: "New York",
        stateCode: "NY",
        zip: null,
      },
    ];

    mockAxios.onGet("/weather/favorites").reply(200, favorites);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/New York/i)).toBeInTheDocument();
    });

    const viewWeatherButton = screen.getByRole("button", {
      name: /View/i,
    });
    fireEvent.click(viewWeatherButton);

    expect(mockNavigate).toHaveBeenCalledWith("/weather/40.7128%2C-74.006");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("shows 'Unfavoriting...' state when a favorite is being removed", async () => {
    const favorites = [
      { _id: "1", user: "user1", name: "New York", date: "2023-10-01" },
    ];

    mockAxios.onGet("/weather/favorites").reply(200, favorites);
    mockAxios.onDelete("/weather/favorites/1").reply(200);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/New York/i)).toBeInTheDocument();
    });

    const removeFavoriteButton = screen.getByRole("button", {
      name: /Remove Favorite/i,
    });
    fireEvent.click(removeFavoriteButton);

    expect(screen.getByAltText(/Unfavoriting.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/New York/i)).not.toBeInTheDocument();
    });
  });

  it("navigates to the homepage when 'Add Your First Favorite' button is clicked in empty state", async () => {
    mockAxios.onGet("/weather/favorites").reply(200, []);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorites"]}>
            <Routes>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });

    expect(
      screen.getByText(/No favorite locations saved/i),
    ).toBeInTheDocument();

    const addFavoriteButton = screen.getByRole("button", {
      name: /Add Your First Favorite/i,
    });
    fireEvent.click(addFavoriteButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
