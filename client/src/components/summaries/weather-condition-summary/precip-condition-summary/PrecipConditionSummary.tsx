import React, { useId } from "react";
import conditionToIconMap from "../../../../utils/weatherIconMapping";
import LoadingSkeleton from "../../../skeletons/LoadingSkeleton";

type WeatherCondition = keyof typeof conditionToIconMap;

interface PrecipConditionSummaryProps {
  condition: WeatherCondition;
  precipitationChance: number | undefined; // e.g. 0.05 means 5% chance of precipitation
  loadingStatus: string;
}

const PrecipConditionSummary: React.FC<PrecipConditionSummaryProps> = ({
  condition,
  precipitationChance = 0,
  loadingStatus,
}) => {
  if (loadingStatus === "loading" || loadingStatus === "idle") {
    return (
      <div className="flex justify-center">
        <LoadingSkeleton width={340} height={100} />
      </div>
    );
  }

  const iconSrc =
    conditionToIconMap[condition] || conditionToIconMap["Unknown"];

  const clampedChance = Math.max(0, Math.min(1, precipitationChance));

  const visualFillPercent =
    clampedChance === 0
      ? 0 // Empty at 0%
      : clampedChance === 1
        ? 1 // Fully filled at 100%
        : 0.15 + clampedChance * 0.65;

  // The path’s approximate vertical extent is y=2 to y=19 (total 17).
  const pathTop = 2;
  const pathBottom = 19;
  const pathHeight = pathBottom - pathTop;

  // Calculate the fill height and starting y-coordinate
  const fillHeight = pathHeight * visualFillPercent;
  const rectY = pathBottom - fillHeight;

  const maskId = useId();

  return (
    <div className="flex items-center justify-between bg-white px-8">
      {/* Left side: Raindrop + Precipitation % */}
      <div className="flex flex-col items-center">
        <div className="mb-0">
          <svg
            className="w-14 h-14 text-blue-400 rounded-full"
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              {/* The mask shape = full white raindrop */}
              <mask id={maskId}>
                <path
                  d="M12 2C10.07 5.03 6 10.1 6 13a6 6 0 0012 0c0-2.9-4.07-7.97-6-11zM12 19a4 4 0 01-4-4c0-1.84 2.4-5.12 4-7.43 1.6 2.32 4 5.6 4 7.43a4 4 0 01-4 4z"
                  fill="white"
                />
              </mask>
            </defs>

            {/* Border path */}
            {clampedChance === 0 && (
              <path
                d="M12 2C10.07 5.03 6 10.1 6 13a6 6 0 0012 0c0-2.9-4.07-7.97-6-11zM12 19a4 4 0 01-4-4c0-1.84 2.4-5.12 4-7.43 1.6 2.32 4 5.6 4 7.43a4 4 0 01-4 4z"
                fill="none" /* No fill for the border */
                stroke="#3b82f6" /* Border color (blue) */
                strokeWidth="0.2" /* Border thickness */
              />
            )}

            <path
              d="M12 2C10.07 5.03 6 10.1 6 13a6 6 0 0012 0c0-2.9-4.07-7.97-6-11zM12 19a4 4 0 01-4-4c0-1.84 2.4-5.12 4-7.43 1.6 2.32 4 5.6 4 7.43a4 4 0 01-4 4z"
              fill="#E8F0FF"
            />

            {/* Water rectangle masked by the drop shape */}
            <rect
              x="0"
              y={rectY}
              width="24"
              height={fillHeight}
              fill="#60a5fa"
              mask={`url(#${maskId})`}
            />
          </svg>
        </div>

        {/* Probability label */}
        <span className="text-sm text-gray-700 font-medium text-center h-5">
          {(clampedChance * 100).toFixed(0)}%
        </span>

        {/* Explanation label */}
        <span className="text-xs text-gray-500 text-center whitespace-nowrap overflow-hidden text-ellipsis">
          Chance of precipitation
        </span>
      </div>

      {/* Right side: Condition icon + Condition label */}
      <div className="flex flex-col items-center">
        <img
          src={iconSrc}
          alt={`${condition} icon`}
          className="w-14 h-14 drop-shadow-sm"
        />
        {/* Condition label */}
        <span className="capitalize text-xs text-gray-700 font-medium  text-center h-5">
          {condition}
        </span>
        {/* Explanation label */}
        <span className="text-xs text-gray-500  text-center  whitespace-nowrap overflow-hidden text-ellipsis">
          Current conditions
        </span>
      </div>
    </div>
  );
};

export default PrecipConditionSummary;
