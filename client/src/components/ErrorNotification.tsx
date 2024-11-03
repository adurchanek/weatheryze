import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { clearError } from "../redux/slices/errorSlice";

const ErrorNotification: React.FC = () => {
  const error = useAppSelector((state) => state.error.message);
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle the visibility toggle when there's an error
  useEffect(() => {
    if (error) {
      // Delay setting visibility to ensure fade-in effect on first render
      setTimeout(() => setIsVisible(true), 10);

      const timer = setTimeout(() => {
        setIsVisible(false); // Trigger fade-out
        setTimeout(() => dispatch(clearError()), 500); // Wait for fade-out to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  if (!error) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 bg-rose-200 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-sm shadow-lg max-w-xs transition-opacity duration-100 ${
        isVisible ? "opacity-100 bottom-8" : "opacity-0 bottom-4"
      }`}
      role="alert"
    >
      <div className="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636"
          />
        </svg>
        <span> {error}</span>
      </div>
    </div>
  );
};

export default ErrorNotification;
