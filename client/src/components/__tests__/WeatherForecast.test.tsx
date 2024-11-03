import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// **Step 1:** Mock Recharts components before importing WeatherForecast
jest.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: any) => (
      <svg data-testid="line-chart">{children}</svg>
    ),
    Line: () => <path data-testid="line" />,
    XAxis: () => <g data-testid="x-axis" />,
    YAxis: () => <g data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <line data-testid="cartesian-grid" />,
  };
});

// **Step 2:** Now import the WeatherForecast component
import WeatherForecast from "../WeatherForecast";
import { ForecastData } from "../../types/weather";

describe("WeatherForecast", () => {
  const forecastDataWithData: ForecastData = {
    hourly: {
      time: ["2024-10-30T00:00:00.000Z", "2024-10-30T01:00:00.000Z"],
      temperature2m: {
        "0": 20.0,
        "1": 19.5,
      },
    },
  };

  const emptyForecastData: ForecastData = {
    hourly: {
      time: [],
      temperature2m: {},
    },
  };

  it("renders the forecast chart with correct data", async () => {
    render(<WeatherForecast forecastData={forecastDataWithData} />);

    // Check for the heading
    expect(screen.getByText(/Hourly Forecast/i)).toBeInTheDocument();

    // Check for the chart container using data-testid="hourly-forecast-chart"
    const chartContainer = screen.getByTestId("hourly-forecast-chart");
    expect(chartContainer).toBeInTheDocument();

    // Within the chart container, find the responsive-container
    const responsiveContainer = within(chartContainer).getByTestId(
      "responsive-container",
    );
    expect(responsiveContainer).toBeInTheDocument();

    // Within responsive-container, find the mocked LineChart
    const lineChart = within(responsiveContainer).getByTestId("line-chart");
    expect(lineChart).toBeInTheDocument();

    // Check for Line components within LineChart
    const lines = within(lineChart).getAllByTestId("line");
    expect(lines.length).toBeGreaterThan(0);

    // Check for XAxis and YAxis
    expect(within(lineChart).getByTestId("x-axis")).toBeInTheDocument();
    expect(within(lineChart).getByTestId("y-axis")).toBeInTheDocument();

    // Check for Tooltip and CartesianGrid
    expect(within(lineChart).getByTestId("tooltip")).toBeInTheDocument();
    expect(within(lineChart).getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("handles empty forecast data gracefully", () => {
    render(<WeatherForecast forecastData={emptyForecastData} />);

    // Check for the heading
    expect(screen.getByText(/Hourly Forecast/i)).toBeInTheDocument();

    // Check that the chart container is NOT present
    const chartContainer = screen.queryByTestId("hourly-forecast-chart");
    expect(chartContainer).not.toBeInTheDocument();

    // Check for the no data message
    expect(
      screen.getByText(/No forecast data available./i),
    ).toBeInTheDocument();
  });
});
