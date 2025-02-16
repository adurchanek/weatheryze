import React from "react";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(val, max));
}

enum TimeState {
  Past = "Past",
  Present = "Present",
  Future = "Future",
}

interface WindArrowProps {
  cx?: number;
  cy?: number;
  payload?: {
    direction: number;
    speed: number;
    isPast: boolean;
    timeState: string;
  };
  minSpeed: number;
  maxSpeed: number;
  minSizePx: number;
  maxSizePx: number;
}

// A custom shape that Recharts calls for each data point
const WindArrow = (props: WindArrowProps) => {
  const { cx, cy, payload, minSpeed, maxSpeed, minSizePx, maxSizePx } = props;

  if (!payload || cx == null || cy == null) return null;

  const { direction, speed, timeState } = payload;

  function mapSpeedToRange(
    speed: number,
    minIn: number,
    maxIn: number,
    minOut: number,
    maxOut: number,
  ) {
    // If everything has the same speed, avoid dividing by zero
    if (maxIn - minIn < 0.0001) {
      return (minOut + maxOut) / 2;
    }

    // Normalize to [0..1]
    const t = (speed - minIn) / (maxIn - minIn);
    return t * (maxOut - minOut) + minOut;
  }

  let arrowHeight = mapSpeedToRange(
    speed,
    minSpeed,
    maxSpeed,
    minSizePx,
    maxSizePx,
  );

  arrowHeight = clamp(arrowHeight, minSizePx, maxSizePx);

  const rotation = direction;
  const arrowPath = `
    M0,-10 
    L-5,5 
    L0,2 
    L5,5 
    Z
  `;

  const fillColor =
    timeState === TimeState.Past
      ? "#e5e5e5" // Gray
      : timeState === TimeState.Present
        ? "#ff0000" // Red ff0000 ff3333
        : "#0080ff"; // Blue 00c4ff 0080ff

  const offset = 2;

  return (
    <g transform={`translate(${cx}, ${cy - offset})`}>
      <g transform={`rotate(${rotation}) scale(${arrowHeight / 10})`}>
        <path d={arrowPath} fill={fillColor} />
      </g>
    </g>
  );
};

export default WindArrow;
