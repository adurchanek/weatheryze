import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import userReducer from "../../redux/slices/userSlice";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import HomePage from "../../pages/HomePage";
import LoginPage from "../../pages/LoginPage";
import { UserState } from "../../types/user";

interface MinimalRootState {
  user: UserState;
}

describe("ProtectedRoute", () => {
  let store: EnhancedStore<MinimalRootState>;

  const setupStore = (userState: Partial<UserState>) => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          isAuthenticated: false,
          userInfo: null,
          token: null,
          loading: false,
          ...userState,
        },
      },
    });
  };

  it("renders loading state when user is loading", () => {
    setupStore({ loading: true });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<HomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders outlet content (HomePage) when user is authenticated", async () => {
    setupStore({ isAuthenticated: true, loading: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<HomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Weatheryze/i }),
      ).toBeInTheDocument(),
    );
  });

  it("redirects to login page when user is not authenticated", async () => {
    setupStore({ isAuthenticated: false, loading: false });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<HomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    // Adjusted assertions to match actual LoginPage content
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Login/i }),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });
  });
});
