import React from "react";

interface LoadingSkeletonProps {
  width: number;
  height: number;
}

const CircleLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width,
  height,
}) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-50 to-gray-100 rounded-full`}
    style={{
      width: `${width}px`,
      height: `${height}px`,
    }}
    role="status"
  ></div>
);

export default CircleLoadingSkeleton;
