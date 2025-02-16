import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import CollapsibleCard from "../../containers/CollapsibleCard";
import { CurrentAirQualityData } from "../../../types/weather";
import LoadingSkeleton from "../../skeletons/LoadingSkeleton";

interface AirQualityProps {
  currentAirQualityData: CurrentAirQualityData | null;
  loadingStatus: string;
}

const labelToColor = (aqiLabel: string) => {
  switch (aqiLabel?.toLowerCase()) {
    case "good":
      return "text-green-600 bg-green-100 border-green-300";
    case "moderate":
      return "text-amber-400 bg-[#fffff5] border-yellow-400";
    case "unhealthy for sensitive groups":
      return "text-amber-500 bg-amber-50 border-amber-400";
    case "caution":
      return "text-orange-400 bg-orange-100 border-orange-300";
    case "unhealthy":
      return "text-red-500 bg-red-100 border-red-400";
    case "hazardous":
      return "text-purple-700 bg-purple-100 border-purple-500";
    default:
      return "text-gray-600 bg-gray-100 border-gray-300";
  }
};

const pollutantExplanations: Record<string, string> = {
  pm25: "PM2.5 refers to fine particulate matter smaller than 2.5 microns in diameter. High levels can affect respiratory health.",
  pm10: "PM10 refers to larger particulate matter (~10 microns), like dust and pollen.",
  ozone:
    "Ground-level ozone can irritate lungs, especially on hot, sunny days.",
  so2: "Sulfur dioxide is produced primarily from burning fossil fuels. Can cause respiratory issues.",
  no2: "Nitrogen dioxide often comes from vehicle exhaust and industrial emissions.",
};

const AirQuality: React.FC<AirQualityProps> = ({
  currentAirQualityData,
  loadingStatus,
}) => {
  if (loadingStatus === "loading" || loadingStatus === "idle") {
    return (
      <CollapsibleCard title="Current Air Quality" highlightColor="green-50">
        <div className="p-4 space-y-4">
          {/* Simulate Overall AQI */}
          <LoadingSkeleton width={200} height={28} />
          {/* Simulate breakdown */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <LoadingSkeleton width={100} height={28} />
              <LoadingSkeleton width={50} height={28} />
            </div>
          ))}
        </div>
      </CollapsibleCard>
    );
  }

  // Fallback for when no data is available
  if (loadingStatus === "failed" || currentAirQualityData === null) {
    return (
      <CollapsibleCard title="Current Air Quality" highlightColor="green-50">
        <div className="p-4 space-y-4 text-gray-500 text-center">
          No air quality data available.
        </div>
      </CollapsibleCard>
    );
  }

  const { overallAQI, overallLabel, breakdown } = currentAirQualityData;
  const formatAqi = (aqiValue: number) => aqiValue.toFixed(1);

  return (
    <CollapsibleCard title="Current Air Quality" highlightColor="green-50">
      <div className="p-4 space-y-4">
        {/* Overall AQI Section */}
        <div className="flex flex-row items-center justify-between bg-neutral-50 rounded-r-2xl rounded-l-md pl-2">
          <div className="text-base sm:text-lg font-medium text-gray-700">
            Overall:{" "}
            <span className="ml-1 text-gray-800 font-medium">
              {formatAqi(overallAQI)}
            </span>
          </div>
          {/* Colored label badge */}
          <div
            className={`sm:mt-0 inline-block px-3 py-1 text-sm font-medium rounded-full border relative drop-shadow-sm shadow-sm  ${labelToColor(
              overallLabel,
            )}`}
          >
            {overallLabel.toLowerCase() === "unhealthy for sensitive groups"
              ? "Sensitive"
              : overallLabel}
            {overallLabel.toLowerCase() ===
              "unhealthy for sensitive groups" && (
              <div className="group relative inline-block text-orange-400 cursor-pointer ml-1">
                <FontAwesomeIcon icon={faQuestionCircle} size="sm" />
                <div
                  className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-1/2 top-full
                              transform -translate-x-52 -translate-y-2 mt-1 px-2 py-1 text-xs text-white bg-gray-700
                              rounded shadow-lg w-48 z-50 transition-opacity
                              whitespace-normal"
                >
                  Children, the elderly, and individuals with respiratory or
                  heart conditions are at a higher risk when air quality reaches
                  or exceeds this level.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2">
          {Object.entries(breakdown).map(([key, val]) => {
            const pollutantName = key.toUpperCase();
            const aqiValue = val.aqi;
            const aqiLabel = val.label;
            const colorClasses = labelToColor(aqiLabel);
            const explanation =
              pollutantExplanations[key] || "No explanation available.";

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-x-4 bg-neutral-50 rounded-md px-3 py-2"
              >
                {/* Left side: bullet + pollutant name + question mark */}
                <div className="flex items-center space-x-2 relative">
                  <div
                    className={`w-2 h-2 rounded-full border shadow-sm ${colorClasses}`}
                  />
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    {pollutantName}
                  </span>

                  {/* Tooltip Trigger (question icon) */}
                  <div className="group relative inline-block text-gray-400 hover:text-gray-600 cursor-pointer">
                    <FontAwesomeIcon icon={faQuestionCircle} size="sm" />
                    <div
                      className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-1/2 top-full
                                  transform -translate-x-1/3 -translate-y-24 mt-1 px-2 py-1 text-xs text-white bg-gray-700
                                  rounded shadow-lg w-48 z-50 transition-opacity
                                  whitespace-normal"
                    >
                      {explanation}
                    </div>
                  </div>
                </div>

                {/* Right side: AQI Value + Label Badge */}
                <div className="flex justify-between space-x-4 min-w-32">
                  <span className="text-sm text-gray-800 font-medium">
                    {formatAqi(aqiValue)}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border drop-shadow-sm shadow-sm ${colorClasses}`}
                  >
                    {aqiLabel.toLowerCase() === "unhealthy for sensitive groups"
                      ? "Sensitive"
                      : aqiLabel}
                    {aqiLabel.toLowerCase() ===
                      "unhealthy for sensitive groups" && (
                      <div className="group relative inline-block text-orange-400 cursor-pointer ml-1">
                        <FontAwesomeIcon icon={faQuestionCircle} size="sm" />
                        <div
                          className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-1/2 top-full
                                      transform -translate-x-52 -translate-y-20 mt-1 px-2 py-1 text-xs text-white bg-gray-700
                                      rounded shadow-lg w-48 z-50 transition-opacity
                                      whitespace-normal"
                        >
                          Children, the elderly, and individuals with
                          respiratory or heart conditions are at a higher risk
                          when air quality reaches or exceeds this level.
                        </div>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default AirQuality;
