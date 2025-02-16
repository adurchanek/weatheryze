import React from "react";
import conditionToIconMap from "../../../../utils/weatherIconMapping";

interface ConditionIconProps {
  cx?: number;
  cy?: number;
  payload?: {
    condition: string; // "Sunny", "Cloudy", etc.
    timeString: string; // "1 AM"
    indexInData: number;
    timeState: string;
  };
}

const ConditionIcon: React.FC<ConditionIconProps> = ({ cx, cy, payload }) => {
  if (!payload || cx == null) return null;

  if (payload.indexInData % 3 !== 0) {
    return null;
  }

  // If the condition is not in our map, fallback to "Unknown"
  const iconSrc =
    conditionToIconMap[payload.condition as keyof typeof conditionToIconMap] ||
    conditionToIconMap["Unknown"];

  const iconSize = 38;
  const x = cx - iconSize / 2;
  const y = 26;

  return (
    <g filter="url(#iconShadow)">
      <image
        x={x}
        y={y}
        width={iconSize}
        height={iconSize}
        href={iconSrc}
        opacity={payload.timeState === "Past" ? ".15" : "1"}
      />
    </g>
  );
};

export default ConditionIcon;
