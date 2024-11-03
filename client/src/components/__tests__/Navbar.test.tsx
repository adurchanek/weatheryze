import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../Navbar";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import userReducer, { UserState, logout } from "../../redux/slices/userSlice";
import { MemoryRouter } from "react-router-dom";

interface MinimalRootState {
  user: UserState;
}

describe("Navbar", () => {
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

  it("displays login and register links for unauthenticated users", () => {
    setupStore({ isAuthenticated: false });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.queryByText(/Favorites/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });

  it("displays favorites and logout links for authenticated users", () => {
    setupStore({
      isAuthenticated: true,
      userInfo: { _id: "1", name: "John Doe", email: "john@example.com" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Favorites/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
  });

  it("calls logout action when logout button is clicked", () => {
    setupStore({
      isAuthenticated: true,
      userInfo: { _id: "1", name: "John Doe", email: "john@example.com" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>,
    );

    const logoutButton = screen.getByText(/Logout/i);
    act(() => {
      fireEvent.click(logoutButton);
    });

    // Check if logout action was dispatched
    const actions = store.getState().user;
    expect(actions.isAuthenticated).toBe(false);
    expect(actions.userInfo).toBe(null);
    expect(actions.token).toBe(null);
  });
});
