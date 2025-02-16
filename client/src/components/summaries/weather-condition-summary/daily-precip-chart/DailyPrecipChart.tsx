import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Droplet from "./Droplet";
import { PrecipitationChanceData } from "../../../../types/weather";
import { useScreenSize } from "../../../../context/ScreenSizeContext";
import { DateTime } from "luxon";
import LoadingSkeleton from "../../../skeletons/LoadingSkeleton";

interface PrecipitationPoint {
  time: string;
  timestamp: number;
  precipitationChance: number;
}

interface DailyPrecipChartProps {
  precipitationData: PrecipitationChanceData | null;
  range: string; // "1", "3", etc.
  loadingStatus: string;
}

const DailyPrecipChart: React.FC<DailyPrecipChartProps> = ({
  precipitationData,
  range,
  loadingStatus,
}) => {
  if (
    loadingStatus === "loading" ||
    loadingStatus === "idle" ||
    !precipitationData
  ) {
    return (
      <div className="flex justify-center">
        <LoadingSkeleton width={340} height={100} />
      </div>
    );
  }

  const { isSmallScreen } = useScreenSize();
  const { hourly, utcOffsetSeconds } = precipitationData;
  const { time, precipitationChance } = hourly;
  const searchedLocationTimeZone = DateTime.now().setZone(
    precipitationData.timezone,
  ).zoneName;

  // Convert data into array of points
  const precipitationPoints: PrecipitationPoint[] = time.map((_, index) => ({
    time: hourly.time[index],
    timestamp: new Date(hourly.time[index]).getTime(),
    precipitationChance: precipitationChance[index.toString()] / 100 || 0,
  }));

  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0);
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);

  const currentDataPoint = precipitationPoints.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - roundedCurrentTimestamp);
    const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
    return diffCurrent < diffClosest ? point : closest;
  }, precipitationPoints[0]);

  let currentDataPointIndex = precipitationPoints.findIndex(
    (point) => point.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }

  const updatedData = precipitationPoints.map((point, index) => {
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
      <ScatterChart
        margin={{
          top: 30,
          right: 20,
          bottom: 0,
          left: 0,
        }}
      >
        {/* Define a background gradient in <defs> */}
        <defs>
          <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="time"
          interval={isSmallScreen ? 3 : 2}
          tick={{ fill: "#555555", fontSize: 10 }}
          tickFormatter={(time) => {
            // Convert the original UTC timestamp to account for the timezone offset
            const utcTime = new Date(time).getTime();
            const correctedTime = utcTime - utcOffsetSeconds * 1000;

            // Format the corrected time for the searched location's timezone
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: searchedLocationTimeZone || "UTC",
              hour: "numeric",
              hour12: true,
            });

            return formatter.format(new Date(correctedTime));
          }}
        />
        <YAxis
          dataKey="precipitationChance"
          label={{
            value: "Precipitation (%)",
            angle: -90,
            position: "insideLeft",
            fill: "#333333",
            fontSize: 12,
            dy: 40,
            dx: 3,
          }}
          tickFormatter={(value) => `${Math.round(value * 100)}%`}
          tick={{ fill: "#555555", fontSize: 11 }}
          domain={[0, 1]}
        />
        <ReferenceLine
          x={currentDataPoint.time}
          stroke="#595959"
          strokeOpacity={0.8}
          strokeWidth={1.65}
          strokeDasharray="5 5"
          label={{
            value: getCurrentTime(currentDataPoint.time),
            position: "top",
            fill: "#5b5c5e",
            fontSize: 9,
            fontWeight: "bold",
            dy:
              currentDataPoint.precipitationChance > 0.55
                ? -10
                : currentDataPoint.precipitationChance > 0.5
                  ? -6
                  : 0,
            dx: 4,
          }}
        />

        <Scatter
          data={updatedData}
          shape={(scatterProps: any) => <Droplet {...scatterProps} />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default DailyPrecipChart;
