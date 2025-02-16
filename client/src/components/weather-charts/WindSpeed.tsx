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
import { WindSpeedData } from "../../types/weather";
import CustomTooltip from "./chart-utils/CustomTooltip";
import ChartContainer from "../containers/ChartContainer";
import ChartLoadingSkeleton from "../skeletons/ChartLoadingSkeleton";
import { DateTime } from "luxon";
import { useScreenSize } from "../../context/ScreenSizeContext";
import CustomYAxisLabel from "./chart-utils/CustomYAxisLabel";
import CustomXAxisTick from "./chart-utils/CustomXAxisTick";

interface ChartDataPoint {
  time: string;
  timestamp: number;
  windSpeed: number;
}

interface WindSpeedChartProps {
  windSpeedData: WindSpeedData | null;
  range: string;
  onRangeChange: (newRange: string) => void;
  loadingStatus: string;
}

const getXAxisInterval = (r: string, isSmallScreen: boolean): number => {
  switch (r) {
    case "1": // 1 Day Range
      return isSmallScreen ? 3 : 2;
    case "3": // 3 Day Range
      return isSmallScreen ? 11 : 5;
    case "7": // 7 Day Range
      return isSmallScreen ? 23 : 11;
    case "14": // 14 Day Range
      return isSmallScreen ? 47 : 23;
    default:
      return 1; // Show all ticks if unknown
  }
};
const getDotRadius = (r: string, smallScreen: boolean): number => {
  switch (r) {
    case "1":
      return 4;
    case "3":
      return smallScreen ? 1.7 : 2.5;
    case "7":
    case "14":
      return 0;
    default:
      return 0;
  }
};

const WindSpeedChart: React.FC<WindSpeedChartProps> = ({
  windSpeedData,
  range,
  onRangeChange,
  loadingStatus,
}) => {
  // If data is missing or still loading, show your skeleton
  if (
    !windSpeedData ||
    loadingStatus === "loading" ||
    loadingStatus === "idle"
  ) {
    return (
      <ChartContainer
        title="Wind Speed"
        range={range}
        onRangeChange={onRangeChange}
        highlightColor="blue-50"
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
  const { hourly, utcOffsetSeconds, timezone } = windSpeedData;
  const searchedLocationTimeZone = DateTime.now().setZone(timezone).zoneName;

  // Make sure we have actual wind speed data
  if (
    !hourly ||
    !hourly.time ||
    !hourly.windSpeed10m ||
    hourly.time.length === 0 ||
    Object.keys(hourly.windSpeed10m).length === 0
  ) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-xl font-extralight mb-4 text-gray-600">
          Wind Speed
        </h2>
        <div className="text-gray-600">No wind data available.</div>
      </div>
    );
  }

  // Build an array of numeric wind speed values, sorted by time
  const windSpeedArray: number[] = Object.keys(hourly.windSpeed10m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => {
      return Number(hourly.windSpeed10m[key].toFixed(1));
    });

  // Sync up times and speeds into a single array
  const minLength = Math.min(hourly.time.length, windSpeedArray.length);
  const chartData: ChartDataPoint[] = Array.from(
    { length: minLength },
    (_, i) => {
      const timestamp = new Date(hourly.time[i]).getTime();
      return {
        time: hourly.time[i],
        timestamp,
        windSpeed: windSpeedArray[i],
      };
    },
  );

  // Figure out the “current” local timestamp, to split past vs future
  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  // Round to the nearest half hour, so the reference line matches your forecast style
  const roundToNearestHalfHour = (ts: number) => {
    const date = new Date(ts);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0);
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);

  // Find the data point that is closest to “now”
  const currentDataPoint =
    chartData.find((p) => p.timestamp === roundedCurrentTimestamp) ||
    chartData.reduce((closest, p) => {
      const diffCurrent = Math.abs(p.timestamp - roundedCurrentTimestamp);
      const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
      return diffCurrent < diffClosest ? p : closest;
    }, chartData[0]);

  // Index at which future data starts
  let currentDataPointIndex = chartData.findIndex(
    (point) => point.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }

  // Create new array with separate keys for past & future wind speeds
  const updatedData = chartData.map((point, index) => ({
    ...point,
    pastWindSpeed: index < currentDataPointIndex ? point.windSpeed : null,
    futureWindSpeed:
      index >= currentDataPointIndex - 1 ? point.windSpeed : null,
  }));

  // Format the reference line label
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

  // Finally, render the chart
  return (
    <ChartContainer
      title="Wind Speed"
      range={range}
      onRangeChange={onRangeChange}
      highlightColor="blue-50"
    >
      {loadingStatus === "loading" || loadingStatus === "idle" ? (
        <ChartLoadingSkeleton />
      ) : (
        <>
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
              {/* Gradients for past vs future wind speed areas */}
              <defs>
                <linearGradient
                  id="pastWindGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#AAAAAA" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient
                  id="windSpeedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ac62ff" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#c58fff" stopOpacity={0.3} />
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
                    title={"Wind Speed (mph)"}
                  />
                }
              />

              {(isTooltipEnabled || !isSmallScreen) && (
                <Tooltip
                  content={
                    <CustomTooltip
                      utcOffsetSeconds={utcOffsetSeconds}
                      timeZone={searchedLocationTimeZone}
                      defaultUnit="mph"
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
                  // Rename legend labels
                  const legendLabels: { [key: string]: string } = {
                    pastWindSpeed: "Past",
                    futureWindSpeed: "Wind Speed",
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

              {/* Past wind speed area */}
              <Area
                type="monotone"
                dataKey="pastWindSpeed"
                stroke="#b3b3b3"
                strokeOpacity={0.3}
                strokeWidth={range === "1" ? 1 : range === "3" ? 0.95 : 0.9}
                fill="url(#pastWindGradient)"
                fillOpacity={1}
                connectNulls={true}
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-in-out"
              />

              {/* Reference line for "current time" */}
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

              {/* Future wind speed area */}
              <Area
                type="monotone"
                dataKey="futureWindSpeed"
                stroke="#ac62ff"
                strokeWidth={range === "1" ? 3 : range === "3" ? 1.95 : 1.9}
                fill="url(#windSpeedGradient)"
                fillOpacity={1}
                dot={({ key, ...dotProps }) => (
                  <Dot
                    key={key}
                    {...dotProps}
                    r={getDotRadius(range, isSmallScreen)}
                    stroke="#8c2bff"
                    strokeWidth={1}
                    fill="#f6f0ff"
                  />
                )}
                activeDot={{
                  r: range === "1" ? 6 : range === "3" ? 5 : 3,
                  fill: "#ac62ff",
                  stroke: "#f6f0ff",
                }}
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </ChartContainer>
  );
};

export default WindSpeedChart;
