import React from "react";

const ChartLoadingSkeleton: React.FC = () => (
  <div
    className="animate-pulse h-[300px] sm:h-[300px] bg-gradient-to-r from-gray-50 to-gray-100"
    role="status"
  ></div>
);

export default ChartLoadingSkeleton;
