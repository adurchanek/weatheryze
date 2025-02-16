import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { clearError } from "../../redux/slices/errorSlice";

const ErrorNotification: React.FC = () => {
  const error = useAppSelector((state) => state.error.message);
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => setIsVisible(true), 10);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => dispatch(clearError()), 500); // Wait for fade-out to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  if (!error) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 bg-red-500 text-white text-center text-xs font-medium px-4 py-3 z-50 transition-transform duration-500 sm:text-sm ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${"w-full md:w-1/4"}`}
      role="alert"
      style={{
        height: "60px",
      }}
    >
      <div className="flex items-center justify-center h-full space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
        <span>{error}</span>
      </div>
    </div>
  );
};

export default ErrorNotification;
