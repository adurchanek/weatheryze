import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WeatherSummary from "../WeatherSummary";

// Mock ResizeObserver globally for this test file if not using setupTests.ts
beforeAll(() => {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserver,
  });
});

describe("WeatherSummary", () => {
  it("renders weather summary with correct data", () => {
    const props = {
      location: "Los Angeles",
      temperature: 30,
      humidity: 50,
      windSpeed: 15,
      condition: "Clear",
    };

    render(<WeatherSummary {...props} />);

    // Check for the heading with location
    expect(
      screen.getByRole("heading", { name: /Weather in Los Angeles/i }),
    ).toBeInTheDocument();

    // Check for temperature
    const temperatureLabel = screen.getByText(/Temperature:/i);
    expect(temperatureLabel).toBeInTheDocument();
    const temperatureContainer = temperatureLabel.parentElement;
    expect(temperatureContainer).toHaveTextContent("Temperature: 30°C");

    // Check for humidity
    const humidityLabel = screen.getByText(/Humidity:/i);
    expect(humidityLabel).toBeInTheDocument();
    const humidityContainer = humidityLabel.parentElement;
    expect(humidityContainer).toHaveTextContent("Humidity: 50%");

    // Check for wind speed
    const windSpeedLabel = screen.getByText(/Wind Speed:/i);
    expect(windSpeedLabel).toBeInTheDocument();
    const windSpeedContainer = windSpeedLabel.parentElement;
    expect(windSpeedContainer).toHaveTextContent("Wind Speed: 15 km/h");

    // Check for condition
    const conditionLabel = screen.getByText(/Condition:/i);
    expect(conditionLabel).toBeInTheDocument();
    const conditionContainer = conditionLabel.parentElement;
    expect(conditionContainer).toHaveTextContent("Condition: Clear");
  });

  it("handles empty or missing data gracefully", () => {
    const props = {
      location: "",
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      condition: "",
    };

    render(<WeatherSummary {...props} />);

    // Check for the heading with default location
    expect(
      screen.getByRole("heading", { name: /^Weather in\s*Unknown Location$/i }),
    ).toBeInTheDocument();

    // Check for temperature
    const temperatureLabel = screen.getByText(/Temperature:/i);
    expect(temperatureLabel).toBeInTheDocument();
    const temperatureContainer = temperatureLabel.parentElement;
    expect(temperatureContainer).toHaveTextContent("Temperature: 0°C");

    // Check for humidity
    const humidityLabel = screen.getByText(/Humidity:/i);
    expect(humidityLabel).toBeInTheDocument();
    const humidityContainer = humidityLabel.parentElement;
    expect(humidityContainer).toHaveTextContent("Humidity: 0%");

    // Check for wind speed
    const windSpeedLabel = screen.getByText(/Wind Speed:/i);
    expect(windSpeedLabel).toBeInTheDocument();
    const windSpeedContainer = windSpeedLabel.parentElement;
    expect(windSpeedContainer).toHaveTextContent("Wind Speed: 0 km/h");

    // Check for condition
    const conditionLabel = screen.getByText(/Condition:/i);
    expect(conditionLabel).toBeInTheDocument();
    const conditionContainer = conditionLabel.parentElement;
    expect(conditionContainer).toHaveTextContent("Condition: N/A");
  });
});
