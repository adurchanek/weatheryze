import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterPage from "../RegisterPage";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import userReducer from "../../redux/slices/userSlice";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { UserState } from "../../types/user";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

interface RootState {
  user: UserState;
}

describe("RegisterPage", () => {
  let store: EnhancedStore<RootState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore<RootState>({
      reducer: {
        user: userReducer,
      },
    });
  });

  it("renders registration form", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      screen.getByRole("heading", { name: /Register/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i }),
    ).toBeInTheDocument();
  });

  it("allows user to register successfully", async () => {
    const fakeToken = "fake-jwt-token";
    const userInfo = { _id: "1", name: "Test User", email: "test@example.com" };

    mockedAxios.post.mockResolvedValueOnce({ data: { token: fakeToken } });
    mockedAxios.get.mockResolvedValueOnce({ data: userInfo });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/auth/user", {
        headers: { Authorization: `Bearer ${fakeToken}` },
      });
    });

    // Check if the user state has been updated
    const state = store.getState();
    expect(state.user.isAuthenticated).toBe(true);
    expect(state.user.userInfo).toEqual(userInfo);
    expect(state.user.token).toBe(fakeToken);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles registration failure", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Registration failed"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Registration failed:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
