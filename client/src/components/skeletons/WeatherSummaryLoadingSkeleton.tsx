import React from "react";

const WeatherSummaryLoadingSkeleton: React.FC = () => (
  <div
    className="animate-pulse relative mx-auto drop-shadow-sm bg-white w-full shadow-sm sm:rounded-lg rounded-xl h-[336px] lg:h-[388px] md:h-[344px] bg-gradient-to-r from-gray-50 to-gray-100"
    role="status"
  ></div>
);

export default WeatherSummaryLoadingSkeleton;
