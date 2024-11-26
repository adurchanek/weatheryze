import React from "react";

interface WeatherSummaryProps {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({
  location,
  temperature,
  humidity,
  windSpeed,
  condition,
}) => {
  return (
    <div
      className="p-6 bg-white  text-center max-w-sm mx-auto"
      aria-label="weather-summary"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Weather in {location || "Unknown Location"}
      </h2>
      <p className="text-lg text-gray-600">
        <span className="font-semibold">Temperature:</span> {temperature}°C
      </p>
      <p className="text-lg text-gray-600">
        <span className="font-semibold">Humidity:</span> {humidity}%
      </p>
      <p className="text-lg text-gray-600">
        <span className="font-semibold">Wind Speed:</span> {windSpeed} km/h
      </p>
      <p className="text-lg text-gray-600">
        <span className="font-semibold">Condition:</span> {condition || "N/A"}
      </p>
    </div>
  );
};

export default WeatherSummary;
