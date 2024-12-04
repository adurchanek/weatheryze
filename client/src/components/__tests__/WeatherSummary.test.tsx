import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import WeatherSummary from "../WeatherSummary";

describe("WeatherSummary", () => {
  const mockHandleToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders weather summary with correct data", () => {
    const props = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
      isFavorite: true,
      handleToggleFavorite: mockHandleToggleFavorite,
      isDisabled: false,
    };

    render(<WeatherSummary {...props} />);

    // Check for the heading with location
    expect(
      screen.getByRole("heading", { name: /Los Angeles/i }),
    ).toBeInTheDocument();

    // Check for condition and temperature
    expect(screen.getByText(/Clear, 30°C/i)).toBeInTheDocument();

    // Check for humidity and wind speed
    expect(
      screen.getByText(/Humidity: 50% \| Wind Speed: 15 km\/h/i),
    ).toBeInTheDocument();

    // Check for the heart icon
    expect(
      screen.getByRole("button", { name: /Remove from Favorites/i }),
    ).toBeInTheDocument();
  });

  it("handles empty or missing data gracefully", () => {
    const props = {
      location: "",
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      condition: "",
      isFavorite: false,
      handleToggleFavorite: mockHandleToggleFavorite,
      isDisabled: true,
    };

    render(<WeatherSummary {...props} />);

    // Check for the heading with default location
    expect(
      screen.getByRole("heading", { name: /^Unknown Location$/i }),
    ).toBeInTheDocument();

    // Check for condition and temperature
    expect(screen.getByText(/, 0°C/i)).toBeInTheDocument();

    // Check for humidity and wind speed
    expect(
      screen.getByText(/Humidity: 0% \| Wind Speed: 0 km\/h/i),
    ).toBeInTheDocument();

    // Check for the heart icon
    expect(
      screen.getByRole("button", { name: /Add to Favorites/i }),
    ).toBeInTheDocument();
  });

  it("calls handleToggleFavorite when heart icon is clicked if not disabled", () => {
    const props = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
      isFavorite: true,
      handleToggleFavorite: mockHandleToggleFavorite,
      isDisabled: false,
    };

    render(<WeatherSummary {...props} />);

    // Click the heart icon
    fireEvent.click(
      screen.getByRole("button", { name: /Remove from Favorites/i }),
    );

    // Ensure the callback is called
    expect(mockHandleToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("does not call handleToggleFavorite when heart icon is clicked and disabled", () => {
    const props = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
      isFavorite: true,
      handleToggleFavorite: mockHandleToggleFavorite,
      isDisabled: true,
    };

    render(<WeatherSummary {...props} />);

    // Attempt to click the heart icon
    fireEvent.click(
      screen.getByRole("button", { name: /Remove from Favorites/i }),
    );

    // Ensure the callback is not called
    expect(mockHandleToggleFavorite).not.toHaveBeenCalled();
  });

  it("displays the correct heart icon and disables it based on isFavorite and isDisabled props", () => {
    const props = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
      isFavorite: true,
      handleToggleFavorite: mockHandleToggleFavorite,
      isDisabled: true,
    };

    // Render with isFavorite = true and isDisabled = true
    const { rerender } = render(<WeatherSummary {...props} />);
    const button = screen.getByRole("button", {
      name: /Remove from Favorites/i,
    });
    expect(button).toBeDisabled();

    // Update to isFavorite = false and isDisabled = false
    rerender(
      <WeatherSummary {...props} isFavorite={false} isDisabled={false} />,
    );
    expect(
      screen.getByRole("button", { name: /Add to Favorites/i }),
    ).not.toBeDisabled();
  });
});
