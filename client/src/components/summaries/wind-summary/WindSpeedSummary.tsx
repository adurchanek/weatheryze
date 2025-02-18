import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import CollapsibleCard from "../../containers/CollapsibleCard";
import { WindData } from "../../../types/weather";
import LoadingSkeleton from "../../skeletons/LoadingSkeleton";
import WindDirectionChart from "./WindDirectionChart";
import CircleLoadingSkeleton from "../../skeletons/CircleLoadingSkeleton";

interface WindSpeedSummaryProps {
  currentWindSpeed: number | undefined;
  currentWindDirection: number | undefined;
  currentWeatherLoadingStatus: "idle" | "loading" | "succeeded" | "failed";
  dailyWindLoadingStatus: "idle" | "loading" | "succeeded" | "failed";
  dailyWindData: WindData | null;
}

const WindSpeedSummary: React.FC<WindSpeedSummaryProps> = ({
  currentWindSpeed,
  currentWindDirection,
  currentWeatherLoadingStatus,
  dailyWindLoadingStatus,
  dailyWindData,
}) => {
  if (
    dailyWindLoadingStatus === "loading" ||
    dailyWindLoadingStatus === "idle" ||
    !dailyWindData
  ) {
    return (
      <CollapsibleCard title="Today's Wind" highlightColor="blue-50">
        <div className="flex justify-center">
          <LoadingSkeleton width={400} height={364} />
        </div>
      </CollapsibleCard>
    );
  }

  // Convert compass labels (N, NE, E, etc.) to degrees
  const degreesToCompass = (degrees: number): string => {
    degrees = (degrees + 360) % 360;
    if (degrees >= 337.5 || degrees < 22.5) {
      return "N";
    } else if (degrees < 67.5) {
      return "NE";
    } else if (degrees < 112.5) {
      return "E";
    } else if (degrees < 157.5) {
      return "SE";
    } else if (degrees < 202.5) {
      return "S";
    } else if (degrees < 247.5) {
      return "SW";
    } else if (degrees < 292.5) {
      return "W";
    } else {
      return "NW";
    }
  };
  degreesToCompass(currentWindDirection || 0);
  const ARROW_BASE_OFFSET = -45;

  const finalRotation = currentWindDirection
    ? (currentWindDirection + 180) % 360
    : 0;

  // State for one-time arrow rotation animation
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRotation(finalRotation);
    }, 200);

    return () => clearTimeout(timer);
  }, [finalRotation]);

  return (
    <CollapsibleCard title="Today's Wind" highlightColor="blue-50">
      <div
        className="mx-auto max-w-full p-3 sm:p-5 bg-gradient-to-bl from-indigo-50 via-sky-50 to-purple-100 rounded-b-md shadow-sm drop-shadow border-b border-b-gray-300
                       transition-shadow duration-300 relative mb-px md:h-[233px]"
      >
        <div className="w-48 h-48 mx-auto relative">
          {/* Directional labels, moved inward + smaller text */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-gray-600 text-sm font-medium">
            N
          </div>
          <div className="absolute top-5 right-2 text-gray-600 text-sm font-medium">
            NE
          </div>
          <div className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-600 text-sm font-medium">
            E
          </div>
          <div className="absolute bottom-5 right-2 text-gray-600 text-sm font-medium">
            SE
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600 text-sm font-medium">
            S
          </div>
          <div className="absolute bottom-5 left-2 text-gray-600 text-sm font-medium">
            SW
          </div>
          <div className="absolute top-1/2 left-1 -translate-y-1/2 text-gray-600 text-sm font-medium">
            W
          </div>
          <div className="absolute top-5 left-2 text-gray-600 text-sm font-medium">
            NW
          </div>

          {currentWeatherLoadingStatus === "loading" ||
          currentWeatherLoadingStatus === "idle" ? (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          flex flex-col items-center justify-center "
            >
              <CircleLoadingSkeleton width={128} height={128} />
            </div>
          ) : (
            <div
              className="absolute w-32 h-32 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          flex flex-col items-center justify-center rounded-full bg-white pt-6 border-4 border-sky-200 shadow-inner"
            >
              <FontAwesomeIcon
                icon={faLocationArrow}
                className="text-[#00c4ff] text-4xl transition-transform duration-700 ease-in-out mt-1 drop-shadow-md"
                style={{
                  transform: `rotate(${rotation + ARROW_BASE_OFFSET}deg)`,
                }}
              />

              <span className="mt-0 text-lg font-light text-gray-600 select-none pointer-events-none">
                {currentWindSpeed?.toFixed(0)} mph
              </span>
            </div>
          )}
        </div>
      </div>
      <WindDirectionChart
        range={"1"}
        loadingStatus={dailyWindLoadingStatus}
        windData={dailyWindData}
      ></WindDirectionChart>
    </CollapsibleCard>
  );
};

export default WindSpeedSummary;
