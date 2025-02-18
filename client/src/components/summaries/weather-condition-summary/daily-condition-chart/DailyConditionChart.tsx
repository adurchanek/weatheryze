import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { useScreenSize } from "../../../../context/ScreenSizeContext";
import LoadingSkeleton from "../../../skeletons/LoadingSkeleton";
import { ConditionData } from "../../../../types/weather";
import { DateTime } from "luxon";
import ConditionIcon from "./ConditionIcon";

// Props for the chart
export interface DailyConditionChartProps {
  conditionData: ConditionData | null;
  range: string;
  loadingStatus: string;
}

const DailyConditionChart: React.FC<DailyConditionChartProps> = ({
  conditionData,
  range,
  loadingStatus,
}) => {
  const { isSmallScreen } = useScreenSize();

  if (
    loadingStatus === "loading" ||
    loadingStatus === "idle" ||
    !conditionData
  ) {
    return (
      <div className="flex justify-center">
        <LoadingSkeleton width={340} height={100} />
      </div>
    );
  }

  const { hourly, utcOffsetSeconds, timezone } = conditionData;

  const { time, condition } = hourly;

  const searchedLocationTimeZone = DateTime.now().setZone(timezone).zoneName;

  // Transform data into a structure usable for the chart
  const data = time.map((timestamp, i) => {
    const cond = condition[i.toString()] || "Unknown";

    return {
      time: new Date(timestamp).toISOString(),
      x: i,
      y: 0,
      condition: cond,
      timeString: new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      }),
      indexInData: i,
      timestamp: new Date(timestamp).getTime(),
    };
  });

  const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

  const roundToNearestHalfHour = (timestamp: number) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    date.setMinutes(roundedMinutes, 0, 0);
    return date.getTime();
  };

  const roundedCurrentTimestamp = roundToNearestHalfHour(currentLocalTimestamp);
  data.reduce((closest, point) => {
    const diffCurrent = Math.abs(point.timestamp - roundedCurrentTimestamp);
    const diffClosest = Math.abs(closest.timestamp - roundedCurrentTimestamp);
    return diffCurrent < diffClosest ? point : closest;
  }, data[0]);
  let currentDataPointIndex = data.findIndex(
    (point) => point.timestamp >= currentLocalTimestamp,
  );

  if (currentDataPointIndex === -1) {
    currentDataPointIndex = 24;
  }

  let updatedData = data.map((point, index) => {
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

  updatedData = updatedData.map((point, index, array) => {
    // Determine the start and end of the current window
    const windowStart = Math.floor(index / 3) * 3;
    const windowEnd = Math.min(windowStart + 2, array.length - 1);

    // Get the first condition and the last timeState in the window
    const firstCondition = array[windowStart].condition;
    const lastTimeState = array[windowEnd].timeState;

    return {
      ...point,
      condition: firstCondition,
      timeState: lastTimeState,
    };
  });

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: searchedLocationTimeZone || "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <ResponsiveContainer width="100%" height={86}>
      <ScatterChart
        margin={{
          top: 10,
          right: 20,
          bottom: -10,
          left: -32,
        }}
      >
        <defs>
          <filter id="iconShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.15"
            />
          </filter>
        </defs>

        <XAxis
          dataKey="time"
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
          interval={isSmallScreen ? 3 : 2}
          tick={{ fill: "#555", fontSize: 10 }}
          padding={{ left: 15, right: 0 }}
        />

        <YAxis
          dataKey="precipitationChance"
          label={{
            value: "Forecast",
            angle: -90,
            position: "insideLeft",
            fill: "#333333",
            fontSize: 12,
            dy: 40,
            dx: 35,
          }}
          tickFormatter={(value) => `${Math.round(value * 100)}%`}
          tick={false}
          domain={[0, 1]}
        />

        <Scatter
          data={updatedData}
          shape={(scatterProps: any) => <ConditionIcon {...scatterProps} />}
          animationDuration={500}
          animationEasing="ease-out"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default DailyConditionChart;
