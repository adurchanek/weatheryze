import React from "react";
import { getDayLabelInterval } from "./Shared";
import { useScreenSize } from "../../../context/ScreenSizeContext";

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string | number };
  index?: number;
  range: string;
  isSmallScreen: boolean;
  utcOffsetSeconds: number;
  searchedLocationTimeZone: string | null;
}

const CustomXAxisTick: React.FC<CustomXAxisTickProps> = ({
  x,
  y,
  payload,
  index,
  range,
  utcOffsetSeconds,
  searchedLocationTimeZone,
}) => {
  if (x === undefined || y === undefined || !payload || index === undefined) {
    return null;
  }

  // Convert to corrected time
  const timeValue = payload.value;
  const utcTime = new Date(timeValue).getTime();
  const correctedTime = utcTime - utcOffsetSeconds * 1000;
  const date = new Date(correctedTime);
  const { isSmallScreen } = useScreenSize();

  let label = "";
  let isBold = false;

  if (range === "1") {
    if (index === 0) {
      // Day label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        weekday: "short",
      }).format(date);
      isBold = true;
    } else {
      // Hour label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        hour: "numeric",
        hour12: true,
      }).format(date);
    }
  } else if (range === "3") {
    if (index % getDayLabelInterval(range, isSmallScreen) === 0) {
      // Day label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        weekday: "short",
      }).format(date);
      isBold = true;
    } else {
      // Hour label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        hour: "numeric",
        hour12: true,
      }).format(date);
    }
  } else if (range === "7") {
    if (index % getDayLabelInterval(range, isSmallScreen) === 0) {
      // Day label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        weekday: "short",
      }).format(date);
      isBold = true;
    } else {
      // Hour label
      label = new Intl.DateTimeFormat("en-US", {
        timeZone: searchedLocationTimeZone || "UTC",
        hour: "numeric",
        hour12: true,
      }).format(date);
    }
  } else if (range === "14") {
    label = new Intl.DateTimeFormat("en-US", {
      timeZone: searchedLocationTimeZone || "UTC",
      month: "numeric",
      day: "numeric",
    }).format(date);
    isBold = true;
  }

  // Render the label
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      fill="#555555"
      fontSize={12}
      fontWeight={isBold ? "bold" : "normal"}
    >
      {label}
    </text>
  );
};

export default CustomXAxisTick;
