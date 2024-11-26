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
import favoritesReducer, {
  FavoritesState,
} from "../../redux/slices/favoritesSlice";
import userReducer from "../../redux/slices/userSlice";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import thunk from "redux-thunk";
import axiosInstance from "../../services/axiosInstance";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axiosInstance);

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

interface MinimalRootState {
  user: { isAuthenticated: boolean; token?: string | null };
  favorites: FavoritesState;
}

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

  it("displays loading state initially", async () => {
    mockAxios.onGet("/weather/favorites").reply(() => new Promise(() => {})); // Keeps promise pending

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

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("displays favorite locations after successful fetch", async () => {
    const favorites = [
      { _id: "1", user: "user1", location: "New York", date: "2023-10-01" },
      { _id: "2", user: "user1", location: "Los Angeles", date: "2023-10-02" },
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
      expect(screen.getByText(/Your Favorite Locations/i)).toBeInTheDocument();
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
      { _id: "1", user: "user1", location: "New York", date: "2023-10-01" },
      { _id: "2", user: "user1", location: "Los Angeles", date: "2023-10-02" },
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

    // Find all "Delete" buttons and click the first one (for "New York")
    const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
    expect(deleteButtons.length).toBe(2); // Ensure there are two delete buttons

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/New York/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    });
  });

  it("navigates to weather page when 'View Weather' button is clicked", async () => {
    const favorites = [
      { _id: "1", user: "user1", location: "New York", date: "2023-10-01" },
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
      name: /View Weather/i,
    });
    fireEvent.click(viewWeatherButton);

    expect(mockNavigate).toHaveBeenCalledWith("/weather/New%20York");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
