import conditionToIconMap from "../../../utils/weatherIconMapping";
import React from "react";

import WeatherSummaryLoadingSkeleton from "../../skeletons/WeatherSummaryLoadingSkeleton";
import { CurrentWeatherSummary } from "../../../types/weather";

interface WeatherSummaryProps {
  location: string;
  currentWeatherSummaryData: CurrentWeatherSummary | null;
  isFavorite: boolean;
  handleToggleFavorite: () => void;
  isDisabled: boolean;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed";
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({
  location,
  currentWeatherSummaryData,
  isFavorite,
  handleToggleFavorite,
  isDisabled,
  loadingStatus,
}) => {
  if (
    loadingStatus === "loading" ||
    loadingStatus === "idle" ||
    currentWeatherSummaryData === null
  ) {
    return <WeatherSummaryLoadingSkeleton />;
  }

  return (
    <div
      className=" relative mx-auto drop-shadow-sm bg-white w-full shadow-sm sm:rounded-lg rounded-xl h-full"
      aria-label="weather-summary"
    >
      {/* Heart Icon */}
      <div className="sticky top-16 flex justify-end p-2 sm:p-4">
        <button
          aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          onClick={handleToggleFavorite}
          disabled={isDisabled}
          className={`sm:w-10 sm:h-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md focus:outline-none ${
            isDisabled
              ? "opacity-75"
              : isFavorite
                ? "bg-red-100"
                : "hover:bg-blue-400 bg-sky-300 shadow-sm drop-shadow-md border-2 border-sky-200"
          }`}
        >
          <img
            src={
              isFavorite ? "/heart-filled-icon.svg" : "/heart-empty-icon.svg"
            }
            alt={isFavorite ? "Remove Favorite" : "Add Favorite"}
            className="sm:w-6 sm:h-6 w-5 h-5"
          />
        </button>
      </div>

      {/* Weather Summary */}
      <div className="flex items-center sm:space-x-12 lg:pl-14 md:pl-12 sm:pl-8 pl-6 rounded-lg sm:w-[90%] p-2 sm:p-4">
        <div>
          <h1 className="text-3xl text-gray-800 drop-shadow-sm">
            {location || "Unknown Location"}
          </h1>
          <div className="flex flex-row mt-2 sm:my-4">
            <div className="mt-6 sm:mr-4 mr-3 text-4xl text-gray-600 drop-shadow-sm font-[300]">
              {currentWeatherSummaryData?.weather.temperature?.toFixed(0)}°F
            </div>
            <div>
              <div className="sm:px-2 px-2 text-gray-700 sm:text-2xl text-2xl sm:mt-2 mt-3 font-thin flex">
                <div className="mr-1">
                  {currentWeatherSummaryData?.weather.condition}
                </div>
                <img
                  src={
                    conditionToIconMap[
                      currentWeatherSummaryData?.weather
                        .condition as keyof typeof conditionToIconMap
                    ] || conditionToIconMap["Unknown"]
                  }
                  alt={`${currentWeatherSummaryData?.weather.condition} icon`}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg my-auto drop-shadow-sm"
                />
              </div>
              <p className="sm:px-2 px-2 text-sm sm:text-md text-gray-600 mt-1 mb-5">
                Humidity: {currentWeatherSummaryData?.weather.humidity}% | Wind{" "}
                {currentWeatherSummaryData?.weather.windSpeed?.toFixed(0)} mph
              </p>
            </div>
          </div>
          <p className="text-gray-600 xl:text-lg text-md mt-2 mb-4 mx-2 sm:m-4 font-light md:min-h-[116px] lg:leading-snug xl:leading-normal leading-normal">
            {`"${currentWeatherSummaryData?.summary}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherSummary;
