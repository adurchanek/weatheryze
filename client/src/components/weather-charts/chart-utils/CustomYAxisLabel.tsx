import React from "react";

const CustomYAxisLabel = ({
  x = 0,
  y = 0,
  isTooltipEnabled,
  toggleTooltip,
  hideTooltip,
  title,
}: any) => {
  const toggleScale = 0.25;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* First label */}
      <text
        x={-100}
        y={30}
        fill="#333333"
        fontSize="14"
        textAnchor="middle"
        transform="rotate(-90)"
      >
        {title}
      </text>

      {hideTooltip && (
        <>
          <text
            x={"calc(80%)"}
            y={"calc(96.5%)"}
            fill="#888888"
            opacity={0.5}
            fontSize="10"
            textAnchor="middle"
          >
            {isTooltipEnabled ? "Tooltip Enabled" : "Tooltip Disabled"}
          </text>

          <foreignObject
            x={"calc(80% + 35px)"}
            y={"calc(93%)"}
            width={100 * toggleScale}
            height={50 * toggleScale}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: `${100 * toggleScale}px`,
                height: `${50 * toggleScale}px`,
              }}
            >
              <div
                onClick={toggleTooltip}
                className={`flex items-center rounded-full cursor-pointer transition ${
                  isTooltipEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
                style={{
                  width: `${56 * toggleScale}px`,
                  height: `${32 * toggleScale}px`,
                  padding: `${4 * toggleScale}px`,
                }}
              >
                <div
                  className="rounded-full shadow-md transform transition"
                  style={{
                    width: `${24 * toggleScale}px`,
                    height: `${24 * toggleScale}px`,
                    transform: isTooltipEnabled
                      ? `translateX(${24 * toggleScale}px)`
                      : `translateX(0)`,
                    backgroundColor: "white",
                  }}
                ></div>
              </div>
            </div>
          </foreignObject>
        </>
      )}
    </g>
  );
};

export default CustomYAxisLabel;
