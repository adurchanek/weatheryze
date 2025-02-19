import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { DateTime } from "luxon";
import { useScreenSize } from "../../../context/ScreenSizeContext";
import { WindData } from "../../../types/weather";
import WindArrow from "./WindArrow";
import LoadingSkeleton from "../../skeletons/LoadingSkeleton";

interface WindPoint {
  time: string;
  timestamp: number;
  direction: number;
  speed: number;
}

interface WindDirectionChartProps {
  windData: WindData | null;
  range: string;
  loadingStatus: string;
}

const WindDirectionChart: React.FC<WindDirectionChartProps> = ({
  windData,
  range,
  loadingStatus,
}) => {
  if (!windData || loadingStatus === "loading" || loadingStatus === "idle") {
    return (
      <div className="flex justify-center">
        <LoadingSkeleton width={400} height={130} />
      </div>
    );
  }

  const { isSmallScreen } = useScreenSize();
  const { hourly, utcOffsetSeconds } = windData;
  const searchedLocationTimeZone = DateTime.now().setZone(
    windData.timezone,
  ).zoneName;

  const directionArray = Object.keys(hourly.windDirection10m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => {
      return (hourly.windDirection10m[key] + 180) % 360; // Add 180 and normalize
    });

  const speedArray = Object.keys(hourly.windSpeed10m)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => hourly.windSpeed10m[key]);

  const hasData =
    hourly &&
    hourly.time.length > 0 &&
    directionArray.length > 0 &&
    speedArray.length > 0;

  if (!hasData) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-xl font-extralight mb-4 text-gray-600">
          Wind Direction
        </h2>
        <div className="text-gray-600">No wind data available.</div>
      </div>
    );
  }

  const minLength = Math.min(
    hourly.time.length,
    directionArray.length,
    speedArray.length,
  );

  const windPoints: WindPoint[] = Array.from(
    { length: minLength },
    (_, index) => {
      const timestamp = new Date(hourly.time[index]).getTime();
      return {
        time: hourly.time[index],
        timestamp,
        direction: directionArray[index],
        speed: speedArray[index],
      };
    },
  );

  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0);
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);
  windPoints.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - roundedCurrentTimestamp);
    const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
    return diffCurrent < diffClosest ? point : closest;
  }, windPoints[0]);

  let currentDataPointIndex = windPoints.findIndex(
    (point) => point.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }
  const updatedData = windPoints.map((point, index) => {
    let timeState: "Past" | "Present" | "Future";

    switch (true) {
      case index < currentDataPointIndex - 1:
        timeState = "Past";
        break;
      case index === currentDataPointIndex - 1:
        timeState = "Present";
        break;
      default:
        timeState = "Future";
        break;
    }

    return {
      ...point,
      isPast: index < currentDataPointIndex - 1,
      timeState,
    };
  });
  new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const minSpeed = Math.min(...speedArray);
  const maxSpeed = Math.max(...speedArray);

  return (
    <ResponsiveContainer width="100%" height={130}>
      <ScatterChart
        margin={{
          top: 20,
          right: 40,
          bottom: 0,
          left: 10,
        }}
      >
        <XAxis
          dataKey="time"
          interval={3}
          tickFormatter={(time) => {
            // Convert the original UTC timestamp to account for the timezone offset
            const utcTime = new Date(time).getTime();
            const correctedTime = utcTime - utcOffsetSeconds * 1000;

            // Format the corrected time for the searched location's timezone
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: searchedLocationTimeZone || "UTC", // Use the correct timezone or fallback to UTC
              hour: "numeric",
              hour12: true,
            });

            return formatter.format(new Date(correctedTime));
          }}
          tick={{ fill: "#555555", fontSize: isSmallScreen ? 10 : 12 }}
          padding={{ left: 8, right: 0 }}
        />
        <YAxis
          dataKey="speed"
          label={{
            value: "Speed (mph)",
            angle: -90,
            position: "insideLeft",
            fill: "#333333",
            fontSize: 14,
            dy: 40,
            dx: 15,
          }}
          tick={{ fill: "#555555", fontSize: 12 }}
        />

        <Scatter
          data={updatedData}
          shape={(scatterProps: any) => (
            <WindArrow
              {...scatterProps}
              minSpeed={minSpeed}
              maxSpeed={maxSpeed}
              minSizePx={3}
              maxSizePx={12}
            />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default WindDirectionChart;
