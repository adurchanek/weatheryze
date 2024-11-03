import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ForecastData } from "../types/weather";

interface ChartDataPoint {
  time: string;
  temperature: number;
}

interface WeatherForecastProps {
  forecastData: ForecastData;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecastData }) => {
  const { hourly } = forecastData;

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

  // Transform temperature2m object into a sorted array
  const temperatureArray: number[] = Object.keys(hourly.temperature2m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.temperature2m[key]);

  // Ensure the time array and temperature array have the same length
  const minLength = Math.min(hourly.time.length, temperatureArray.length);

  const chartData: ChartDataPoint[] = Array.from(
    { length: minLength },
    (_, index) => ({
      time: new Date(hourly.time[index]).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: temperatureArray[index],
    }),
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Hourly Forecast
      </h2>
      {/* Wrap ResponsiveContainer with a div that has data-testid to avoid warnings */}
      <div data-testid="hourly-forecast-chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherForecast;
