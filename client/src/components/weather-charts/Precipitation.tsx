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
import { PrecipitationData } from "../../types/weather";
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
  rain: number;
  snowfall: number;
}

interface PrecipitationProps {
  precipitationData: PrecipitationData | null;
  range: string;
  onRangeChange: (newRange: string) => void;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed";
}

const Precipitation: React.FC<PrecipitationProps> = ({
  precipitationData,
  range,
  onRangeChange,
  loadingStatus,
}) => {
  if (!precipitationData) {
    return (
      <ChartContainer
        title="Precipitation"
        range={range}
        onRangeChange={onRangeChange}
        highlightColor="sky-50"
      >
        <ChartLoadingSkeleton />
      </ChartContainer>
    );
  }

  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

  const toggleTooltip = () => {
    setIsTooltipEnabled((prev) => !prev);
  };
  const { isSmallScreen } = useScreenSize();

  const { hourly, utcOffsetSeconds } = precipitationData;
  const searchedLocationTimeZone = DateTime.now().setZone(
    precipitationData.timezone,
  ).zoneName;

  // Format the corrected time
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC", // Use the correct timezone or fallback to UTC
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const getCurrentTime = (time: string) => {
    return formatter.format(
      new Date(new Date(time).getTime() - (utcOffsetSeconds || 0) * 1000),
    );
  };

  const rainArray: number[] = Object.keys(hourly.rain)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.rain[key]);

  const snowfallArray: number[] = Object.keys(hourly.snowfall)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.snowfall[key]);

  const hasData =
    hourly &&
    hourly.time.length > 0 &&
    rainArray.length > 0 &&
    snowfallArray.length > 0;

  if (!hasData) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-xl font-extralight mb-4 text-gray-600">
          Hourly Precipitation
        </h2>
        <div className="text-gray-600">No precipitation data available.</div>
      </div>
    );
  }

  const minLength = Math.min(
    hourly.time.length,
    rainArray.length,
    snowfallArray.length,
  );

  const chartData: ChartDataPoint[] = Array.from(
    { length: minLength },
    (_, index) => {
      const timestamp = new Date(hourly.time[index]).getTime();
      return {
        time: hourly.time[index],
        timestamp,
        rain: rainArray[index],
        snowfall: snowfallArray[index],
      };
    },
  );

  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  // Round current timestamp to the nearest half-hour
  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0); // Reset seconds and milliseconds
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);

  const currentDataPoint = chartData.reduce((closest, point) => {
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
    pastRain: index < currentDataPointIndex ? point.rain : null,
    futureRain: index >= currentDataPointIndex - 1 ? point.rain : null,
    pastSnowfall: index < currentDataPointIndex ? point.snowfall : null,
    futureSnowfall: index >= currentDataPointIndex - 1 ? point.snowfall : null,
  }));

  return (
    <ChartContainer
      title="Precipitation"
      range={range}
      onRangeChange={onRangeChange}
      highlightColor="sky-50"
    >
      {loadingStatus === "loading" || loadingStatus === "idle" ? (
        <ChartLoadingSkeleton />
      ) : (
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
              <defs>
                <linearGradient
                  id="precipPastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#AAAAAA" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#4A90E2" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B3E5FC" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#B3E5FC" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#4A90E2" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B3E5FC" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#B3E5FC" stopOpacity={0.3} />
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
                  title={"Precipitation (in)"}
                />
              }
            />
            {(isTooltipEnabled || !isSmallScreen) && (
              <Tooltip
                content={
                  <CustomTooltip
                    utcOffsetSeconds={utcOffsetSeconds}
                    timeZone={searchedLocationTimeZone}
                    defaultUnit="in"
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
              formatter={(value) => {
                const legendLabels: { [key: string]: string } = {
                  pastRain: "Past Rain",
                  futureRain: "Rain",
                  pastSnowfall: "Past Snow",
                  futureSnowfall: "Snow",
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
            <ReferenceLine
              x={currentDataPoint.time}
              stroke="#595959"
              strokeWidth={1.75}
              strokeDasharray="5 5"
              label={{
                value: getCurrentTime(currentDataPoint.time),
                position: "top",
                fill: "#5b5c5e",
                fontSize: 11,
                fontWeight: "bold",
                dy: -4,
              }}
            />
            <Area
              type="monotone"
              dataKey="pastRain"
              stroke="#b3b3b3"
              strokeOpacity={0.3}
              strokeWidth={range === "1" ? 1 : range === "3" ? 0.95 : 0.9}
              fill="url(#precipPastGradient)"
              connectNulls={true}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="pastSnowfall"
              stroke="#b3b3b3"
              strokeOpacity={0.3}
              strokeWidth={range === "1" ? 1 : range === "3" ? 0.95 : 0.9}
              fill="url(#precipPastGradient)"
              connectNulls={true}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="futureRain"
              stroke="#4A90E2"
              strokeWidth={range === "1" ? 3 : range === "3" ? 1.95 : 1.9}
              fill="url(#rainGradient)"
              fillOpacity={1}
              dot={({ key, index, payload, ...otherProps }) => {
                const value = payload?.rain; // Current value
                const prevValue = index > 0 ? chartData[index - 1]?.rain : 0; // Previous value, fallback to 0
                const nextValue =
                  index < chartData.length - 1 ? chartData[index + 1]?.rain : 0; // Next value, fallback to 0

                // Render a dot if the value is non-zero or if it's zero and adjacent to a non-zero value
                if (
                  value !== 0 ||
                  (value === 0 && (prevValue > 0 || nextValue > 0))
                ) {
                  return (
                    <Dot
                      key={key}
                      {...otherProps}
                      r={getDotRadius(range, isSmallScreen)} // Calculated using the helper
                      stroke="#4A90E2" // Hardcoded for rain
                      strokeWidth={1} // Specific to rain
                      fill="#f4f9ff" // Hardcoded fill for rain
                    />
                  );
                }

                return <svg key={`dot-${key}`} />;
              }}
              activeDot={{
                r: range === "1" ? 6 : range === "3" ? 5 : 3,
                fill: "#4A90E2",
                stroke: "#FFFFFF",
              }}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="futureSnowfall"
              stroke="#B3E5FC"
              strokeWidth={range === "1" ? 3 : range === "3" ? 1.95 : 1.9}
              fill="url(#snowGradient)"
              fillOpacity={1}
              dot={({ key, index, payload, ...otherProps }) => {
                const value = payload?.snowfall; // Current value
                const prevValue =
                  index > 0 ? chartData[index - 1]?.snowfall : 0; // Previous value, fallback to 0
                const nextValue =
                  index < chartData.length - 1
                    ? chartData[index + 1]?.snowfall
                    : 0; // Next value, fallback to 0

                // Render a dot if the value is non-zero or if it's zero and adjacent to a non-zero value
                if (
                  value !== 0 ||
                  (value === 0 && (prevValue > 0 || nextValue > 0))
                ) {
                  return (
                    <Dot
                      key={key}
                      {...otherProps}
                      r={getDotRadius(range, isSmallScreen)}
                      stroke="#FFFFFF"
                      strokeWidth={range === "1" ? 2 : range === "3" ? 1.25 : 0}
                      fill="#B3E5FC"
                    />
                  );
                }

                return <svg key={`dot-${key}`} />;
              }}
              activeDot={{
                r: range === "1" ? 6 : range === "3" ? 5 : 3,
                fill: "#B3E5FC",
                stroke: "#f4f9ff",
              }}
              isAnimationActive={true}
              animationDuration={700} // Reduced duration
              animationEasing="ease-in-out" // Smoother and faster easing
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default Precipitation;
