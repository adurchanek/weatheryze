import React, { useState } from "react";
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
import { ForecastData } from "../../types/weather";
import CustomTooltip from "./chart-utils/CustomTooltip";
import ChartContainer from "../containers/ChartContainer";
import ChartLoadingSkeleton from "../skeletons/ChartLoadingSkeleton";
import { DateTime } from "luxon";
import { useScreenSize } from "../../context/ScreenSizeContext";
import CustomYAxisLabel from "./chart-utils/CustomYAxisLabel";
import { getDotRadius, getXAxisInterval } from "./chart-utils/Shared";
import CustomXAxisTick from "./chart-utils/CustomXAxisTick";

interface ChartDataPoint {
  time: string;
  timestamp: number;
  temperature: number;
}

interface ForecastProps {
  forecastData: ForecastData | null;
  range: string;
  onRangeChange: (newRange: string) => void;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed";
}

const Forecast: React.FC<ForecastProps> = ({
  forecastData,
  range,
  onRangeChange,
  loadingStatus,
}) => {
  if (
    !forecastData ||
    loadingStatus === "loading" ||
    loadingStatus === "idle"
  ) {
    return (
      <ChartContainer
        title="Temperature"
        range={range}
        onRangeChange={onRangeChange}
        highlightColor="red-50"
      >
        <ChartLoadingSkeleton />
      </ChartContainer>
    );
  }
  const { isSmallScreen } = useScreenSize();
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

  const toggleTooltip = () => {
    setIsTooltipEnabled((prev) => !prev);
  };

  const { hourly, utcOffsetSeconds } = forecastData;
  const searchedLocationTimeZone = DateTime.now().setZone(
    forecastData.timezone,
  ).zoneName;

  // Format the corrected time
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const getCurrentTimeLabel = (time: string) => {
    return formatter.format(
      new Date(new Date(time).getTime() - (utcOffsetSeconds || 0) * 1000),
    );
  };

  const hasData =
    hourly &&
    hourly.time.length > 0 &&
    Object.keys(hourly.temperature2m).length > 0;

  if (!hasData) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-xl font-extralight mb-4 text-gray-600">
          Hourly Forecast
        </h2>
        <div className="text-gray-600">No forecast data available.</div>
      </div>
    );
  }

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

  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0); // Reset seconds and milliseconds
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);

  const currentDataPoint =
    chartData.find((point) => point.timestamp === roundedCurrentTimestamp) ||
    chartData.reduce((closest, point) => {
      const diffCurrent = Math.abs(point.timestamp - roundedCurrentTimestamp);
      const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
      return diffCurrent < diffClosest ? point : closest;
    }, chartData[0]);

  let currentDataPointIndex = chartData.findIndex(
    (point) => point.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }

  const updatedData = chartData.map((point, index) => ({
    ...point,
    pastTemperature: index < currentDataPointIndex ? point.temperature : null, // Populate for past
    futureTemperature:
      index >= currentDataPointIndex - 1 ? point.temperature : null, // Populate for future
  }));

  return (
    <ChartContainer
      title="Temperature"
      range={range}
      onRangeChange={onRangeChange}
      highlightColor="red-50"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={updatedData}
          margin={{
            top: isSmallScreen ? 10 : 15,
            right: 40,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="pastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AAAAAA" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.03} />
            </linearGradient>
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
            interval={getXAxisInterval(range, isSmallScreen)}
            tickFormatter={(time, index) => {
              // Convert UTC time from API to milliseconds
              const utcTime = new Date(time).getTime();

              // Correct for the searched location's time zone
              const correctedTime = utcTime - utcOffsetSeconds * 1000;
              const date = new Date(correctedTime);

              if (range === "1") {
                return index === 0
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      weekday: "short",
                    }).format(date)
                  : new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      hour: "numeric",
                      hour12: true,
                    }).format(date);
              } else if (range === "3") {
                return index % 4 === 0
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      weekday: "short",
                    }).format(date)
                  : new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      hour: "numeric",
                      hour12: true,
                    }).format(date);
              } else if (range === "7") {
                return index % 2 === 0
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      weekday: "short",
                    }).format(date)
                  : new Intl.DateTimeFormat("en-US", {
                      timeZone: searchedLocationTimeZone || "UTC",
                      hour: "numeric",
                      hour12: true,
                    }).format(date);
              } else if (range === "14") {
                return new Intl.DateTimeFormat("en-US", {
                  timeZone: searchedLocationTimeZone || "UTC",
                  month: "numeric",
                  day: "numeric",
                }).format(date);
              }

              return "";
            }}
            tick={
              <CustomXAxisTick
                range={range}
                isSmallScreen={isSmallScreen}
                utcOffsetSeconds={utcOffsetSeconds}
                searchedLocationTimeZone={searchedLocationTimeZone}
              />
            }
          />

          <YAxis
            tick={{ fill: "#555555", fontSize: 12 }}
            label={
              <CustomYAxisLabel
                isTooltipEnabled={isTooltipEnabled}
                toggleTooltip={toggleTooltip}
                hideTooltip={isSmallScreen}
                title={"Temperature (°F)"}
              />
            }
          />
          {(isTooltipEnabled || !isSmallScreen) && (
            <Tooltip
              content={
                <CustomTooltip
                  utcOffsetSeconds={utcOffsetSeconds}
                  timeZone={searchedLocationTimeZone}
                />
              }
            />
          )}
          <Legend
            verticalAlign="top"
            height={44}
            wrapperStyle={{ paddingBottom: isSmallScreen ? 48 : 10 }}
            iconType="circle"
            iconSize={10}
            formatter={(value: string) => {
              const legendLabels: { [key: string]: string } = {
                futureTemperature: "Temperature",
                pastTemperature: "Past",
              };

              return (
                <span
                  style={{
                    color: "#4A4A4A",
                    fontSize: isSmallScreen ? "10px" : "12px",
                  }}
                >
                  {legendLabels[value] || value}
                </span>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="pastTemperature"
            stroke="#b3b3b3"
            strokeOpacity={0.3}
            strokeWidth={range === "1" ? 1 : range === "3" ? 0.95 : 0.9}
            fill="url(#pastGradient)"
            fillOpacity={1}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-in-out"
          />
          <ReferenceLine
            x={currentDataPoint.time}
            stroke="#595959"
            strokeWidth={1.75}
            strokeDasharray="5 5"
            label={{
              value: getCurrentTimeLabel(currentDataPoint.time),
              position: "top",
              fill: "#5b5c5e",
              fontSize: 11,
              fontWeight: "bold",
              dy: -4,
            }}
          />
          <Area
            type="monotone"
            dataKey="futureTemperature"
            stroke="#FF6F61"
            strokeWidth={range === "1" ? 3 : range === "3" ? 1.95 : 1.9}
            fill="url(#temperatureGradient)"
            fillOpacity={1}
            dot={({ key, ...otherProps }) => (
              <Dot
                key={key}
                {...otherProps}
                r={getDotRadius(range, isSmallScreen)}
                stroke="#FF6F61"
                strokeWidth={1}
                fill="#ffebe2"
              />
            )}
            activeDot={{
              r: range === "1" ? 6 : range === "3" ? 5 : 3,
              fill: "#FF6F61",
              stroke: "#FFD7C4",
            }}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default Forecast;
