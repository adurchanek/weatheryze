import React from "react";
import CollapsibleCard from "./CollapsibleCard";

interface ChartContainerProps {
  title: string;
  range: string;
  onRangeChange: (newRange: string) => void;
  children: React.ReactNode;
  highlightColor?: string;
}

const rangeOptions = [
  { label: "1 Day", value: "1" },
  { label: "3 Days", value: "3" },
  { label: "7 Days", value: "7" },
  { label: "14 Days", value: "14" },
];

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  range,
  onRangeChange,
  children,
  highlightColor = "red-50",
}) => {
  // Build the row of range buttons to pass to CollapsibleCard's headerContent
  const headerContent = (
    <>
      {rangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onRangeChange(option.value)}
          className={`text-sm font-medium px-2 sm:px-6 py-1 border-b-2 transition ${
            range === option.value
              ? "text-blue-500 border-blue-500"
              : "text-gray-500 border-transparent"
          } hover:text-blue-500 hover:border-blue-500`}
        >
          {option.label}
        </button>
      ))}
    </>
  );

  return (
    <CollapsibleCard
      title={title}
      highlightColor={highlightColor}
      headerContent={headerContent}
    >
      {children}
    </CollapsibleCard>
  );
};

export default ChartContainer;
