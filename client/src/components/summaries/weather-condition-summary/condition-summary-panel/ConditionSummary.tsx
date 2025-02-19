import React from "react";
import CollapsibleCard from "../../../containers/CollapsibleCard";
import LoadingSkeleton from "../../../skeletons/LoadingSkeleton";
import PrecipConditionSummary from "../precip-condition-summary/PrecipConditionSummary";
import DailyPrecipChart from "../daily-precip-chart/DailyPrecipChart";
import {
  ConditionData,
  PrecipitationChanceData,
} from "../../../../types/weather";
import DailyConditionChart from "../daily-condition-chart/DailyConditionChart"; // <-- your summary component

interface ConditionSummaryProps {
  condition: string;
  loadingStatus: string;
  precipitationChanceData: PrecipitationChanceData | null;
  conditionData: ConditionData | null;
}

const ConditionSummary: React.FC<ConditionSummaryProps> = ({
  condition,
  loadingStatus,
  precipitationChanceData,
  conditionData,
}) => {
  if (
    loadingStatus === "loading" ||
    loadingStatus === "idle" ||
    !conditionData
  ) {
    return (
      <CollapsibleCard title="Today's Conditions" highlightColor="blue-50">
        <div className="flex justify-center">
          <LoadingSkeleton width={400} height={364} />
        </div>
      </CollapsibleCard>
    );
  }

  const { hourly, utcOffsetSeconds = 0 } = precipitationChanceData || {};
  const { time: precipitationChanceDataTime, precipitationChance } =
    hourly || {};

  // Helper to find the current precipitation chance
  const getCurrentPrecipitationChance = (): number | undefined => {
    if (!precipitationChanceDataTime || !precipitationChance) return undefined;

    // Get the current local timestamp
    const currentLocalTimestamp = Date.now() + utcOffsetSeconds * 1000;

    // Round to the nearest hour or half-hour
    const roundToNearestHalfHour = (timestamp: number) => {
      const date = new Date(timestamp);
      const minutes = date.getMinutes();
      const roundedMinutes = minutes < 30 ? 0 : 30;
      date.setMinutes(roundedMinutes, 0, 0);
      return date.getTime();
    };
    const roundedCurrentTimestamp = roundToNearestHalfHour(
      currentLocalTimestamp,
    );

    // Find the closest time in the data
    let closestIndex = 0;
    let smallestDiff = Infinity;
    precipitationChanceDataTime.forEach((timestamp, index) => {
      const diff = Math.abs(
        new Date(timestamp).getTime() - roundedCurrentTimestamp,
      );
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = index;
      }
    });

    const currentPrecipitationChance =
      precipitationChance[closestIndex.toString()];

    // Get the precipitation chance for the closest timestamp
    return currentPrecipitationChance
      ? currentPrecipitationChance / 100
      : currentPrecipitationChance;
  };
  // Calculate the current precipitation chance dynamically
  const currentPrecipitationChance = getCurrentPrecipitationChance();

  return (
    <CollapsibleCard title="Today's Conditions" highlightColor="blue-50">
      <div className="mb-1 space-y-2 bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 ">
        <div className="bg-white px-4 py-2 rounded-b-lg shadow drop-shadow">
          {loadingStatus === "loading" || loadingStatus === "idle" ? (
            <div className="flex justify-center">
              <LoadingSkeleton width={340} height={100} />
            </div>
          ) : (
            <PrecipConditionSummary
              condition={condition as any}
              precipitationChance={currentPrecipitationChance}
              loadingStatus={loadingStatus}
            />
          )}
        </div>
        <div className="bg-white px-4 py-2.5 rounded-lg shadow drop-shadow">
          {loadingStatus === "loading" || loadingStatus === "idle" ? (
            <div className="flex justify-center">
              <LoadingSkeleton width={340} height={100} />
            </div>
          ) : (
            <DailyPrecipChart
              precipitationData={precipitationChanceData}
              range="1"
              loadingStatus={loadingStatus}
            />
          )}
        </div>
        <div className="bg-white rounded-t-lg px-4 py-2.5">
          <DailyConditionChart
            conditionData={conditionData}
            range="1"
            loadingStatus={loadingStatus}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default ConditionSummary;
