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
  Legend,
  Dot,
} from "recharts";
import { ForecastData } from "../types/weather";

interface ChartDataPoint {
  time: string;
  timestamp: number;
  temperature: number;
}

interface WeatherForecastProps {
  forecastData: ForecastData;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecastData }) => {
  const { hourly, utcOffsetSeconds } = forecastData;

  const hasData =
    hourly &&
    hourly.time.length > 0 &&
    Object.keys(hourly.temperature2m).length > 0;

  if (!hasData) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Hourly Forecast
        </h2>
        <div className="text-gray-600">No forecast data available.</div>
      </div>
    );
  }

  // Process data for chart
  const temperatureArray: number[] = Object.keys(hourly.temperature2m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.temperature2m[key]);

  const minLength = Math.min(hourly.time.length, temperatureArray.length);

  const chartData: ChartDataPoint[] = Array.from(
    { length: minLength },
    (_, index) => {
      const timestamp = new Date(hourly.time[index]).getTime();
      return {
        time: hourly.time[index],
        timestamp,
        temperature: Number(temperatureArray[index].toFixed(1)),
      };
    },
  );

  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  const currentDataPoint = chartData.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - currentLocalTimestamp);
    const diffClosest = Math.abs(closest.timestamp - currentLocalTimestamp);
    return diffCurrent < diffClosest ? point : closest;
  }, chartData[0]);

  return (
    <div className="py-6 bg-white border-t border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Hourly Forecast
      </h2>
      <div data-testid="hourly-forecast-chart">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient
                id="temperatureGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#FF6F61" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#FFD7C4" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="6 6"
              stroke="#e3e3e3"
              strokeOpacity={0.8}
            />
            <XAxis
              dataKey="time"
              tickFormatter={(time) =>
                new Date(time).toISOString().slice(11, 16)
              }
              tick={{ fill: "#555555", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#555555", fontSize: 12 }}
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
                fill: "#333333",
                fontSize: 14,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#F9F9F9",
                border: "1px solid #E3E3E3",
                borderRadius: "8px",
                fontSize: "14px",
                padding: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#4A4A4A",
              }}
              formatter={(value: number) => `${value.toFixed(1)}°C`}
              labelFormatter={(label) =>
                `Time: ${new Date(label).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              }
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{
                paddingBottom: 10,
              }}
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span style={{ color: "#4A4A4A", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#FF6F61"
              strokeWidth={3}
              fill="url(#temperatureGradient)"
              fillOpacity={1}
              dot={(props) => {
                const { key, ...otherProps } = props;
                return (
                  <Dot
                    {...otherProps}
                    key={key}
                    r={4}
                    stroke="#FF6F61"
                    strokeWidth={1}
                    fill="#FFD7C4"
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: "#FF6F61",
                stroke: "#FFD7C4",
              }}
            />
            <ReferenceLine
              x={currentDataPoint.time}
              stroke="#4A4A4A"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: "Now",
                position: "top",
                fill: "#4A4A4A",
                fontSize: 12,
                fontWeight: "bold",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherForecast;
