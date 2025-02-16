import React from "react";
import { TooltipProps } from "recharts";

interface CustomTooltipProps extends TooltipProps<number, string> {
  utcOffsetSeconds: number;
  timeZone: string | null;
  defaultUnit?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  utcOffsetSeconds,
  timeZone,
  defaultUnit = "units",
}) => {
  if (active && payload && payload.length) {
    const time = payload[0]?.payload?.time; // Extract the time
    const timestamp = payload[0]?.payload?.timestamp;

    if (!time || !timestamp) {
      console.warn("Invalid time value in payload:", payload);
      return null;
    }

    try {
      // Convert time to correctedTime
      const utcTime = new Date(time).getTime();
      const correctedTime = utcTime - (utcOffsetSeconds || 0) * 1000;

      // Format the date and time
      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone || "UTC",
        month: "short",
        day: "numeric",
      });
      const formattedDate = dateFormatter.format(new Date(correctedTime));

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone || "UTC",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const formattedOnlyTime = timeFormatter.format(new Date(correctedTime));

      // Group data by type (Rain, Snow, etc.), preventing duplicates
      const groupedData = payload.reduce((acc: any, item: any) => {
        const { name, value } = item;
        if (name && value != null) {
          const cleanName = name.replace(/^(past|future)/, "").toLowerCase();
          if (!acc[cleanName]) acc[cleanName] = [];
          const isDuplicate = acc[cleanName].some(
            (entry: any) => entry.time === formattedOnlyTime,
          );
          if (!isDuplicate) {
            acc[cleanName].push({
              time: formattedOnlyTime,
              value,
            });
          }
        }
        return acc;
      }, {});

      // Render the tooltip
      return (
        <div
          style={{
            backgroundColor: "rgba(55,65,81,0.75)", // Dark background
            color: "#EAEAEA", // Light text
            padding: "0px 0px 2px 0px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            fontSize: "12px",
            transform: "translate(8px, -8px)",
            position: "relative",
            border: "1x solid #3A3A3A",
            minWidth: "90px",
          }}
        >
          {/* Date (top line) */}
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "8px",
              padding: "4px 6px 2px 4px",
              color: "#FFFFFF",
              backgroundColor: "rgba(185,185,185,0.18)",
            }}
          >
            {formattedDate}
          </p>

          {/* Grouped data by type (e.g. temperature, rain) */}
          <div className="flex justify-between">
            {Object.keys(groupedData).map((key, index) => (
              <div key={index} style={{ margin: "2    px 0" }}>
                <p
                  style={{
                    margin: "0 0 1px",
                    fontWeight: "thinner",
                    color: "#d9d9d9",
                    fontSize: "12px",
                    padding: "0px 6px 0px 4px",
                  }}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                {groupedData[key].map(({ time, value }: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "2px 6px 2px 16px",
                      borderRadius: "6px",
                      marginBottom: "0px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "lighter",
                        color: "#e9edf1",
                        fontSize: "14px",
                      }}
                    >
                      {time}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: "bolder",
                      }}
                    >
                      {value < 0.01 && value > 0
                        ? value.toFixed(4)
                        : value.toFixed(2)}{" "}
                      {key === "temperature" ? "°F" : defaultUnit}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error formatting tooltip:", error);
      return null;
    }
  }

  return null;
};

export default CustomTooltip;
