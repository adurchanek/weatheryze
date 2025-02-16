import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import CollapsibleCard from "../../containers/CollapsibleCard";
import LoadingSkeleton from "../../skeletons/LoadingSkeleton";
import { TemperatureData } from "../../../types/weather";
import DailyTemperatureChart from "./DailyTemperatureChart";

interface CurrentAndDailyTemperatureData {
  currentTemperature: number;
  feelsLike: number;
  high: number;
  low: number;
  unit?: string;
}

interface TemperatureSummaryProps {
  temperatureData: CurrentAndDailyTemperatureData | null;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed";
  dailyTemperatureLoadingStatus: "idle" | "loading" | "succeeded" | "failed";
  dailyTemperatureData: TemperatureData | null;
}

const renderTickLabels = (props: any, labels: string[]) => {
  const { cx, cy, midAngle, outerRadius, index } = props;
  const RADIAN = Math.PI / 180;
  const angle = -RADIAN * midAngle;

  const x = cx + (outerRadius - 18) * Math.cos(angle);
  const y = cy + (outerRadius - 18) * Math.sin(angle);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      fontSize={10}
      fontWeight="700"
      textAnchor="middle" // Centers the text along the radial line
      dominantBaseline="middle" // Centers text vertically
      stroke="#808080" // Add black outline
      strokeWidth={0.3} // Adjust thickness of the outline
      paintOrder="stroke"
    >
      {labels[index] + "°"}
    </text>
  );
};

const TemperatureSummary: React.FC<TemperatureSummaryProps> = ({
  temperatureData,
  loadingStatus,
  dailyTemperatureLoadingStatus,
  dailyTemperatureData,
}) => {
  if (!temperatureData) {
    return <div>Loading...</div>;
  }

  const { currentTemperature, feelsLike, high, low, unit } = temperatureData;

  const sliceCount = 16;
  const range = high - low;

  // Generate gradient slices
  const gradientData = Array.from({ length: sliceCount }, () => ({ value: 1 }));

  const gradientColors = [
    "#b39ddb",
    "#9575cd",
    "#7e57c2",
    "#5c6bc0",
    "#42a5f5",
    "#64b5f6",
    "#90caf9",
    "#bbdefb",
    "#ffec4c",
    "#ffd54f",
    "#ffb74d",
    "#ff8a65",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#d32f2f",
  ];

  // Calculate current temperature position
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const clamped = Math.max(low, Math.min(currentTemperature, high));
    const fraction = (clamped - low) / range;
    const approximateIndex = Math.round(fraction * (sliceCount - 1));
    setCurrentIndex(
      approximateIndex >= sliceCount ? sliceCount - 1 : approximateIndex,
    );
  }, [currentTemperature, low, high, sliceCount, range]);

  const radialLabels = useMemo(
    () =>
      Array.from({ length: sliceCount }, (_, i) =>
        Math.round(low + (i * range) / sliceCount).toString(),
      ),
    [low, range, sliceCount],
  );

  return (
    <CollapsibleCard title="Today's Temperature" highlightColor="blue-50">
      <>
        {loadingStatus === "loading" || loadingStatus === "idle" ? (
          <div className="flex justify-center">
            <LoadingSkeleton width={400} height={254} />
          </div>
        ) : (
          <div className="pl-2 pr-2 pt-4 pb-2 transition-shadow duration-300 relative flex">
            {/* The Pie Chart */}
            <div style={{ width: "100%", height: 230, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <defs>
                    <filter
                      id="shadow-outer"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="5"
                        floodColor="rgba(0, 0, 0, 0.2)"
                      />
                    </filter>
                    <filter
                      id="shadow-inner"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="3"
                        floodColor="rgba(0, 0, 0, 0.04)"
                      />
                    </filter>
                  </defs>

                  {/* Inner Pie */}
                  <Pie
                    data={gradientData}
                    dataKey="value"
                    startAngle={270}
                    endAngle={-90}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    style={{
                      pointerEvents: "none",
                      filter: "url(#shadow-inner)",
                    }}
                  >
                    {gradientData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={gradientColors[i] || "#ccc"}
                      />
                    ))}
                  </Pie>

                  {/* Label Slice Pie */}
                  <Pie
                    data={radialLabels.map((label) => ({
                      name: label,
                      value: 1,
                    }))}
                    dataKey="value"
                    startAngle={270}
                    endAngle={-90}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={94}
                    label={(props) => renderTickLabels(props, radialLabels)}
                    labelLine={false}
                    style={{ pointerEvents: "none" }}
                  >
                    {radialLabels.map((_, idx) => (
                      <Cell
                        key={`label-cell-${idx}`}
                        fill={
                          idx === currentIndex
                            ? gradientColors[idx]
                            : "transparent"
                        }
                        style={{ pointerEvents: "none" }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Temperature */}
              <div
                className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <div className="text-4xl font-bold text-blue-400 drop-shadow">
                  {currentTemperature.toFixed(0)}
                  {unit}
                </div>
                <div className="text-[13px] text-gray-600">
                  Feels Like{" "}
                  <span className="text-green-500">
                    {feelsLike.toFixed(0)}
                    {unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>

      <div className="bg-white px-0">
        {loadingStatus === "loading" || loadingStatus === "idle" ? (
          <div className="flex justify-center">
            <LoadingSkeleton width={400} height={110} />
          </div>
        ) : (
          <DailyTemperatureChart
            loadingStatus={dailyTemperatureLoadingStatus}
            temperatureData={dailyTemperatureData}
            dailyHigh={high}
            dailyLow={low}
          />
        )}
      </div>
    </CollapsibleCard>
  );
};

export default TemperatureSummary;
