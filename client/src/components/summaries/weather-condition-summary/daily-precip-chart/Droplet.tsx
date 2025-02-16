import React from "react";
import { TimeState } from "../../../../types/weather";

interface DropletProps {
  cx?: number;
  cy?: number;
  payload?: {
    precipitationChance: number;
    timeState: string;
  };
}

const Droplet: React.FC<DropletProps> = ({ cx, cy, payload }) => {
  if (!payload || cx == null || cy == null) return null;

  const clampedChance = Math.max(0, Math.min(1, payload.precipitationChance));

  const fillColorStroke =
    payload.timeState === TimeState.Past
      ? "#e2e2e2" // Gray
      : "#60A5FAFF"; // Blue

  const fillColorFillStart =
    payload.timeState === TimeState.Past ? "#f1f1f1" : "#60a5fa";

  const fillColorFillStop =
    payload.timeState === TimeState.Past ? "#e5e5e5" : "#4487f5";

  const visualFillPercent =
    clampedChance === 0
      ? 0
      : clampedChance === 1
        ? 1
        : 0.2 + clampedChance * 0.6;

  const fillColorInnerFill =
    payload.timeState === TimeState.Past
      ? "#f3f3f3" // Gray
      : "#E8F0FF"; // Blue

  const dropletSize = 10 + clampedChance * 11;

  const pathHeight = 18;
  const fillHeight = pathHeight * visualFillPercent;
  const rectY = 20 - fillHeight;

  const raindropPath =
    "M12 2C10.07 5.03 6 10.1 6 13a6 6 0 0012 0c0-2.9-4.07-7.97-6-11z";

  const maskId = `droplet-mask-${cx}-${cy}`;

  const offset = 6;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <defs>
        {payload.timeState !== TimeState.Past && (
          <filter
            id={`${maskId}-shadow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.15"
            />
          </filter>
        )}
        <linearGradient
          id={`${maskId}-fillGradient`}
          x1="0"
          y1="1"
          x2="0"
          y2="0"
        >
          {/* Lighter at bottom, darker at top */}
          <stop offset="0%" stopColor={`${fillColorFillStart}`} />
          <stop offset="100%" stopColor={`${fillColorFillStop}`} />
        </linearGradient>
        {/* Clip the rectangle to the raindrop shape */}
        <clipPath id={maskId}>
          <path d={raindropPath} />
        </clipPath>
      </defs>

      <g
        filter={`url(#${maskId}-shadow)`}
        transform={`
          translate(${-dropletSize / 2}, ${-dropletSize / 2 - offset})
          scale(${dropletSize / 24})
        `}
      >
        {/* Outer shape: light fill + stroke */}
        <path
          d={raindropPath}
          fill={`${fillColorInnerFill}`}
          stroke={`${fillColorStroke}`}
          strokeWidth={1}
        />

        {/* Filled portion: bottom to top clipped by the raindrop */}
        <rect
          x={0}
          y={rectY}
          width={24}
          height={fillHeight}
          fill={`url(#${maskId}-fillGradient)`}
          clipPath={`url(#${maskId})`}
        />
      </g>
    </g>
  );
};

export default Droplet;
