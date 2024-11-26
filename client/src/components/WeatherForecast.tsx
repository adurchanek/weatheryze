import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ForecastData } from "../types/weather";

interface ChartDataPoint {
  time: string; // Display format for the chart
  timestamp: number; // Actual timestamp for comparison
  temperature: number;
}

interface WeatherForecastProps {
  forecastData: ForecastData;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecastData }) => {
  const { hourly, utcOffsetSeconds } = forecastData;

  // Check if forecast data is available
  const hasData =
    hourly &&
    hourly.time.length > 0 &&
    Object.keys(hourly.temperature2m).length > 0;

  if (!hasData) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Hourly Forecast
        </h2>
        <div>No forecast data available.</div>
      </div>
    );
  }

  // Process the data for the chart
  const temperatureArray: number[] = Object.keys(hourly.temperature2m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.temperature2m[key]);

  const minLength = Math.min(hourly.time.length, temperatureArray.length);

  // Prepare chart data with timestamps
  const chartData: ChartDataPoint[] = Array.from(
    { length: minLength },
    (_, index) => {
      const timestamp = new Date(hourly.time[index]).getTime(); // Ensure accurate timestamp
      return {
        time: hourly.time[index], // Use raw UTC time string
        timestamp,
        temperature: temperatureArray[index],
      };
    },
  );

  // Get the current local timestamp
  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  // Find the nearest data point by timestamp
  const currentDataPoint = chartData.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - currentLocalTimestamp);
    const diffClosest = Math.abs(closest.timestamp - currentLocalTimestamp);

    return diffCurrent < diffClosest ? point : closest;
  }, chartData[0]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Hourly Forecast
      </h2>
      <div data-testid="hourly-forecast-chart">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id="temperatureGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ff0000" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#ff6e6e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(time) =>
                new Date(time).toISOString().slice(11, 16)
              } // Display in UTC "HH:mm"
            />
            <YAxis
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toISOString().slice(11, 16)
              } // Ensure tooltip uses UTC time
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#ff0000"
              strokeWidth={2}
              strokeOpacity={0.8}
              fill="url(#temperatureGradient)" // Gradient fill
              fillOpacity={1}
              dot={{
                r: 3, // Circle radius
                stroke: "#ff6868", // Blue outline color
                fill: "#00f7ff", // Blue fill color
              }}
            />
            {/* Add the ReferenceLine */}
            <ReferenceLine
              x={currentDataPoint.time}
              stroke="#66c9ca"
              strokeWidth={3}
              strokeDasharray="3 3"
              label={{
                value: "Now",
                position: "top",
                fill: "#9a9a9a",
                fontSize: 12,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherForecast;
