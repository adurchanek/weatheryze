import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Text,
} from "recharts";
import { DateTime } from "luxon";
import { TemperatureData } from "../../../types/weather";
import LoadingSkeleton from "../../skeletons/LoadingSkeleton";
import { useScreenSize } from "../../../context/ScreenSizeContext";

interface TemperaturePoint {
  time: string;
  timestamp: number;
  temperature: number;
  timeState: "Past" | "Present" | "Future";
  isPast: boolean;
  pastTemp?: number | null;
  futureTemp?: number | null;
}

interface DailyTemperatureChartProps {
  temperatureData: TemperatureData | null;
  loadingStatus: string; // "idle" | "loading" | ...
  dailyHigh: number;
  dailyLow: number;
}

const gradientColors = [
  "#d32f2f", // Deep red
  "#f44336", // Bright red
  "#ef5350", // Slightly softer red
  "#ff7043", // Red-orange
  "#ff8a65", // Orange
  "#ffa726", // Light orange
  "#ffb74d", // Softer orange
  "#ffcc80", // Pale orange
  "#64b5f6", // Soft blue
  "#42a5f5", // Brighter blue
  "#2196f3", // Standard blue
  "#1e88e5", // Deeper blue
  "#1976d2", // Darker blue (not quite purple)
  "#1565c0", // Almost navy blue
];

interface CombinedCustomDotProps {
  cx?: number; // X coordinate from Recharts
  cy?: number; // Y coordinate from Recharts
  value?: number; // The value at this data point
  index?: number; // The index of the data point
  dailyHigh: number;
  dailyLow: number;
  dailyHighIndex: number;
  dailyLowIndex: number;
  currentIndex: number;
  updatedData: Array<{
    time: string;
    temperature: number;
  }>;
}

const CombinedCustomDot: React.FC<CombinedCustomDotProps> = (props) => {
  const {
    cx,
    cy,
    value,
    index,
    dailyHigh,
    dailyLow,
    dailyHighIndex,
    dailyLowIndex,
    currentIndex,
  } = props;

  if (cx == null || cy == null || value == null || index == null) {
    return null;
  }

  const isHighPoint = value === dailyHigh && index === dailyHighIndex;
  const isLowPoint = value === dailyLow && index === dailyLowIndex;
  const isCurrentPoint = index === currentIndex;
  return (
    <g>
      {isHighPoint && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="red"
            stroke="#fff"
            strokeWidth={1}
          />
          <Text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="red"
            fontSize={8}
            fontWeight="700"
            opacity={0.7}
            stroke="#808080"
            strokeWidth={0.2}
            paintOrder="stroke"
          >
            {`High ${parseFloat(dailyHigh.toFixed(0))}°F`}
          </Text>
        </>
      )}

      {isLowPoint && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="#5678FFFF"
            stroke="#fff"
            strokeWidth={1}
            opacity={1}
          />
          <Text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="#5678FFFF"
            fontSize={8}
            fontWeight="700"
            stroke="#000000"
            strokeWidth={0.2}
            paintOrder="stroke"
          >
            {`Low ${parseFloat(dailyLow.toFixed(0))}°F`}
          </Text>
        </>
      )}

      {isCurrentPoint && (
        <>
          <line
            x1={cx}
            y1={cy - 2.75}
            x2={cx}
            y2={cy + 2.75}
            stroke="#5b5c5e"
            strokeWidth={1.75}
            strokeOpacity={1}
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
};

interface CustomTimeLabelProps {
  x?: number;
  y?: number;
  value?: string | number;
  viewBox?: { x: number; y: number; width: number; height: number }; // Add this
}

const CustomTimeLabel: React.FC<CustomTimeLabelProps> = (props) => {
  if (!props.viewBox) return null;

  const x = props.viewBox.x;
  const y = props.y ?? 25;
  const arrowYPosition = y - 2.5;
  const arrowSize = 2; // 1.5% of the chart width
  const arrowHeight = 8; // Slightly taller than its width

  return (
    <g>
      <text
        x={x}
        y={y - 18}
        fill="#5b5c5e"
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
      >
        {props.value}
      </text>

      <polygon
        points={`
    ${x - arrowSize},${arrowYPosition - arrowHeight - 5} 
    ${x + arrowSize},${arrowYPosition - arrowHeight - 5} 
    ${x},${arrowYPosition - 7}`}
        fill="#5b5c5e"
        opacity={0.85}
      />
    </g>
  );
};

const DailyTemperatureChart: React.FC<DailyTemperatureChartProps> = ({
  temperatureData,
  loadingStatus,
  dailyHigh,
  dailyLow,
}) => {
  if (
    loadingStatus === "loading" ||
    loadingStatus === "idle" ||
    !temperatureData
  ) {
    return (
      <div className="flex justify-center">
        <LoadingSkeleton width={340} height={100} />
      </div>
    );
  }

  const { isSmallScreen } = useScreenSize();
  const { hourly, utcOffsetSeconds, timezone } = temperatureData;
  const { time, temperature2m } = hourly;
  const searchedLocationTimeZone = DateTime.now().setZone(timezone).zoneName;

  // Convert raw arrays into an array of points
  const tempPoints: TemperaturePoint[] = time.map((t, i) => ({
    time: t,
    timestamp: new Date(t).getTime(),
    temperature: temperature2m[i.toString()] || 0,
    timeState: "Future",
    isPast: false,
  }));

  // Round current local time to nearest half hour
  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0); // Reset seconds and milliseconds
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);

  const currentDataPoint = tempPoints.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - roundedCurrentTimestamp);
    const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
    return diffCurrent < diffClosest ? point : closest;
  }, tempPoints[0]);

  // Find index of first future point
  let currentDataPointIndex = tempPoints.findIndex(
    (p) => p.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }

  // Mark Past vs. Future + separate data
  const updatedData = tempPoints.map((point, index) => ({
    ...point,
    isPast: index < currentDataPointIndex,
    pastTemp: index < currentDataPointIndex ? point.temperature : null,
    futureTemp: index >= currentDataPointIndex - 1 ? point.temperature : null,
  }));

  const dailyHighIndices = updatedData
    .map((pt, i) => (pt.temperature === dailyHigh ? i : -1))
    .filter((val) => val !== -1);
  const dailyHighIndex =
    dailyHighIndices.length > 0
      ? dailyHighIndices[dailyHighIndices.length - 1]
      : -1;

  // Find the last occurrence of dailyLow
  const dailyLowIndices = updatedData
    .map((pt, i) => (pt.temperature === dailyLow ? i : -1))
    .filter((val) => val !== -1);
  const dailyLowIndex =
    dailyLowIndices.length > 0
      ? dailyLowIndices[dailyLowIndices.length - 1]
      : -1;

  new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const getCurrentTime = (time: string) => {
    return formatter.format(
      new Date(new Date(time).getTime() - utcOffsetSeconds * 1000),
    );
  };

  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart
        data={updatedData}
        margin={{ top: 30, right: 35, bottom: 0, left: 2 }}
      >
        <defs>
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            {gradientColors.map((color, i) => {
              const offset = `${(i / (gradientColors.length - 1)) * 100}%`;
              return <stop key={color} offset={offset} stopColor={color} />;
            })}
          </linearGradient>
        </defs>

        <XAxis
          dataKey="time"
          interval={3}
          tickFormatter={(time) => {
            const utcTime = new Date(time).getTime();
            const correctedTime = utcTime - utcOffsetSeconds * 1000;
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: searchedLocationTimeZone || "UTC",
              hour: "numeric",
              hour12: true,
            });

            return formatter.format(new Date(correctedTime));
          }}
          tick={{ fill: "#555555", fontSize: isSmallScreen ? 11 : 12 }}
          padding={{ left: 8, right: 0 }}
        />

        <YAxis
          dataKey="temperature"
          label={{
            value: "Temperature (°F)",
            angle: -90,
            position: "insideLeft",
            fill: "#333",
            fontSize: 12,
            dy: 44,
            dx: 16,
          }}
          tick={{ fill: "#555", fontSize: 11 }}
        />

        {/* Dashed line at current time */}
        <ReferenceLine
          x={currentDataPoint.time}
          stroke="transparent"
          label={(props) => {
            return (
              <CustomTimeLabel
                {...props}
                value={getCurrentTime(currentDataPoint.time)}
              />
            );
          }}
        />

        {/* Past line (gray) */}
        <Line
          type="monotone"
          dataKey="pastTemp"
          stroke="#999"
          strokeWidth={1}
          strokeOpacity={0.85}
          strokeDasharray="4 3"
          dot={
            <CombinedCustomDot
              dailyHigh={dailyHigh}
              dailyLow={dailyLow}
              dailyHighIndex={dailyHighIndex}
              dailyLowIndex={dailyLowIndex}
              currentIndex={currentDataPointIndex}
              updatedData={updatedData}
            />
          }
          activeDot={false}
        />

        {/* Future line (gradient) */}
        <Line
          type="monotone"
          dataKey="futureTemp"
          stroke="url(#tempGradient)"
          strokeWidth={1.4}
          dot={
            <CombinedCustomDot
              dailyHigh={dailyHigh}
              dailyLow={dailyLow}
              dailyHighIndex={dailyHighIndex}
              dailyLowIndex={dailyLowIndex}
              currentIndex={currentDataPointIndex - 1}
              updatedData={updatedData}
            />
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DailyTemperatureChart;
