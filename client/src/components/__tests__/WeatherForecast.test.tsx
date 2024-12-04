import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock Recharts components before importing WeatherForecast
jest.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ children }: any) => (
      <svg data-testid="area-chart">{children}</svg>
    ),
    Area: () => <path data-testid="area" />,
    XAxis: () => <g data-testid="x-axis" />,
    YAxis: () => <g data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <line data-testid="cartesian-grid" />,
    ReferenceLine: ({ x, label }: { x: string; label: any }) => (
      <line
        data-testid="reference-line"
        data-x={x}
        aria-label={label?.value || "Reference Line"}
      />
    ),
    Legend: () => <div data-testid="legend" />,
    Dot: () => <circle data-testid="dot" />,
  };
});

// Import the WeatherForecast component
import WeatherForecast from "../WeatherForecast";
import { ForecastData } from "../../types/weather";

describe("WeatherForecast", () => {
  const forecastDataWithData: ForecastData = {
    hourly: {
      time: [
        "2024-10-30T00:00:00.000Z",
        "2024-10-30T01:00:00.000Z",
        "2024-10-30T02:00:00.000Z",
      ],
      temperature2m: {
        "0": 20.0,
        "1": 19.5,
        "2": 18.5,
      },
    },
    utcOffsetSeconds: -18000,
  };

  const emptyForecastData: ForecastData = {
    hourly: {
      time: [],
      temperature2m: {},
    },
    utcOffsetSeconds: 0,
  };

  beforeEach(() => {
    // Mock the system time to match the nearest data point
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-10-30T00:30:00.000Z")); // Adjusted to align with nearest data point
  });

  afterEach(() => {
    jest.useRealTimers(); // Reset timers after each test
  });

  it("renders the forecast chart with correct data and ReferenceLine", () => {
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

    // Within responsive-container, find the mocked AreaChart
    const areaChart = within(responsiveContainer).getByTestId("area-chart");
    expect(areaChart).toBeInTheDocument();

    // Check for Area components within AreaChart
    const areas = within(areaChart).getAllByTestId("area");
    expect(areas.length).toBeGreaterThan(0);

    // Check for XAxis and YAxis
    expect(within(areaChart).getByTestId("x-axis")).toBeInTheDocument();
    expect(within(areaChart).getByTestId("y-axis")).toBeInTheDocument();

    // Check for Tooltip and CartesianGrid
    expect(within(areaChart).getByTestId("tooltip")).toBeInTheDocument();
    expect(within(areaChart).getByTestId("cartesian-grid")).toBeInTheDocument();

    // Check for the ReferenceLine
    const referenceLine = within(areaChart).getByTestId("reference-line");
    expect(referenceLine).toBeInTheDocument();

    // Ensure the ReferenceLine points to the closest data point
    expect(referenceLine).toHaveAttribute(
      "data-x",
      "2024-10-30T00:00:00.000Z", // Adjusted to match the nearest timestamp
    );
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
