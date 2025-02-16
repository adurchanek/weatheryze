import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createNotification } from "../../redux/slices/notificationsSlice";
import { useAuth } from "../../context/AuthContext";

interface AlertFormProps {
  userId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  onAlertCreated?: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({
  userId,
  latitude,
  longitude,
  locationName,
  onAlertCreated,
}) => {
  const [alertType, setAlertType] = useState("rain"); // "rain", "snow", "temperature", "wind"
  const [comparator, setComparator] = useState(">");
  const [threshold, setThreshold] = useState("");
  const [rangeValue, setRangeValue] = useState("1");
  const [intervalValue, setIntervalValue] = useState("30");

  const dispatch = useAppDispatch();
  const { email, profile } = useAuth();

  const handleSubmit = async () => {
    // Build payload for our createNotification thunk
    const payload = {
      userId,
      latitude,
      longitude,
      threshold, // ".001"
      comparator, // ">"
      interval: +intervalValue, // convert string to number
      location: locationName,
      type: alertType,
      range: +rangeValue,
      email: email || profile?.email,
    };

    try {
      const resultAction = await dispatch(createNotification(payload));
      if (createNotification.fulfilled.match(resultAction)) {
        alert("Alert created successfully!");
        onAlertCreated?.();
      } else {
        alert("Failed to create alert. Check console.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Something went wrong creating the alert.");
    }
  };

  return (
    <div className="mt-4 p-2 border rounded-md bg-gray-50 z-10">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          className="mt-1 block w-full border-gray-300 rounded-md"
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
        >
          <option value="rain">Rain</option>
          <option value="snow">Snow</option>
          <option value="temperature">Temperature</option>
          <option value="windSpeed">Wind Speed</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Comparator
        </label>
        <select
          className="mt-1 block w-full border-gray-300 rounded-md"
          value={comparator}
          onChange={(e) => setComparator(e.target.value)}
        >
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="=">=</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Threshold
        </label>
        <input
          type="number"
          step="any"
          className="mt-1 block w-full border-gray-300 rounded-md"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Range (Days)
        </label>
        <select
          className="mt-1 block w-full border-gray-300 rounded-md"
          value={rangeValue}
          onChange={(e) => setRangeValue(e.target.value)}
        >
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Interval (minutes)
        </label>
        <input
          type="number"
          className="mt-1 block w-full border-gray-300 rounded-md"
          value={intervalValue}
          onChange={(e) => setIntervalValue(e.target.value)}
        />
      </div>

      <button
        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
        onClick={handleSubmit}
      >
        Create Alert
      </button>
    </div>
  );
};

export default AlertForm;
