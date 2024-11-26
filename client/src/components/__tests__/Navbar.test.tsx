import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../Navbar";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import userReducer, { UserState } from "../../redux/slices/userSlice";
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

    // Verify that 'Home' link appears twice (desktop and mobile)
    expect(screen.getAllByText(/Home/i)).toHaveLength(2);

    // Check for 'Login' and 'Register' links
    expect(screen.getAllByText(/Login/i)).toHaveLength(2); // Desktop and mobile versions
    expect(screen.getAllByText(/Register/i)).toHaveLength(2);
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

    // Verify that 'Home' link appears twice (desktop and mobile)
    expect(screen.getAllByText(/Home/i)).toHaveLength(2);

    // Check for 'Favorites' and 'Logout' links
    expect(screen.getAllByText(/Favorites/i)).toHaveLength(2); // Desktop and mobile versions
    expect(screen.getAllByText(/Welcome, John Doe/i)).toHaveLength(2); // Desktop and mobile versions
    expect(screen.getAllByText(/Logout/i)).toHaveLength(2); // Desktop and mobile versions
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

    const logoutButtons = screen.getAllByText(/Logout/i);
    act(() => {
      fireEvent.click(logoutButtons[0]); // Click the first logout button
    });

    // Check if logout action was dispatched
    const actions = store.getState().user;
    expect(actions.isAuthenticated).toBe(false);
    expect(actions.userInfo).toBe(null);
    expect(actions.token).toBe(null);
  });
});
