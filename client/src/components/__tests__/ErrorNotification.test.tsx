import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import errorReducer, {
  setError,
  clearError,
} from "../../redux/slices/errorSlice";
import ErrorNotification from "../ErrorNotification";
import { ErrorState } from "../../types/error";

jest.setTimeout(6000); // Set global timeout to 10 seconds

interface MinimalRootState {
  error: ErrorState;
}

describe("ErrorNotification", () => {
  let store: EnhancedStore<MinimalRootState>;

  const setupStore = (errorMessage: string | null) => {
    store = configureStore({
      reducer: {
        error: errorReducer,
      },
      preloadedState: {
        error: {
          message: errorMessage,
        },
      },
    });
  };

  beforeEach(() => {
    setupStore(null);
  });

  it("does not render when there is no error message", () => {
    render(
      <Provider store={store}>
        <ErrorNotification />
      </Provider>,
    );

    expect(screen.queryByText(/ERROR:/i)).not.toBeInTheDocument();
  });

  it("renders the error message when setError is dispatched", () => {
    act(() => {
      store.dispatch(setError("Test Error"));
    });

    render(
      <Provider store={store}>
        <ErrorNotification />
      </Provider>,
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
  });

  it("clears the error message when clearError is dispatched manually", () => {
    act(() => {
      store.dispatch(setError("Manual Clear Test"));
    });

    render(
      <Provider store={store}>
        <ErrorNotification />
      </Provider>,
    );

    // Verify error message is displayed
    expect(screen.getByText("Manual Clear Test")).toBeInTheDocument();

    // Dispatch clearError within act to avoid warning
    act(() => {
      store.dispatch(clearError());
    });

    // Verify error message is cleared
    expect(screen.queryByText("Manual Clear Test")).not.toBeInTheDocument();
  });

  it("clears the error message after 5 seconds", async () => {
    setupStore("Timeout Error");

    render(
      <Provider store={store}>
        <ErrorNotification />
      </Provider>,
    );

    // Ensure the error message initially renders
    expect(screen.getByText("Timeout Error")).toBeInTheDocument();

    // Wait for the error message to clear after the timeout
    await waitFor(
      () => expect(screen.queryByText("Timeout Error")).not.toBeInTheDocument(),
      {
        timeout: 6000,
      },
    );
  });

  it("resets the timer when a new error is set within 5 seconds", async () => {
    setupStore("Initial Error");

    render(
      <Provider store={store}>
        <ErrorNotification />
      </Provider>,
    );

    // Ensure the initial error message renders
    expect(screen.getByText("Initial Error")).toBeInTheDocument();

    // Dispatch a new error within act after 2 seconds
    await act(async () => {
      setTimeout(() => {
        store.dispatch(setError("New Error"));
      }, 2000);
    });

    // Wait for 5 seconds to confirm the new error appears instead of clearing
    await waitFor(
      () => expect(screen.getByText("New Error")).toBeInTheDocument(),
      {
        timeout: 6000,
      },
    );

    // Confirm the initial error is no longer visible
    expect(screen.queryByText("Initial Error")).not.toBeInTheDocument();
  });
});
