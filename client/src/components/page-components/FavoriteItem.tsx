import React, { useState, useRef, useEffect } from "react";
import { Location } from "../../types/location";
import AlertForm from "./AlertForm";
import LocationAlerts from "./LocationAlerts";

interface FavoriteItemProps {
  id: number;
  location: Location;
  name: string;
  onView: (location: Location) => void;
  onDelete: (id: number) => void;
  userId: string | null;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({
  id,
  location,
  name,
  onView,
  onDelete,
  userId,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showAlertsList, setShowAlertsList] = useState(false);

  // A ref for our entire card so we can detect outside clicks
  const cardRef = useRef<HTMLDivElement>(null);

  // Close popovers if user clicks outside this card
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowAlertsList(false);
        setShowAlertForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleFavorite = () => {
    setIsToggling(true);
    onDelete(id);
  };

  return (
    <div
      ref={cardRef}
      className="relative rounded-lg border border-neutral-200 bg-white shadow-sm p-4 flex flex-col"
    >
      <div className="flex-1">
        <h2 className="text-xl text-gray-800 mb-2 line-clamp-2">{name}</h2>
      </div>

      <div className="flex items-center justify-between mt-2 space-x-2">
        {/* View Weather */}
        <button
          onClick={() => onView(location)}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100
                     border border-blue-200 rounded-lg hover:bg-blue-200
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          View
        </button>

        {/* Show Alerts */}
        <button
          onClick={() => setShowAlertsList((prev) => !prev)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100
                     border border-gray-200 rounded-lg hover:bg-gray-200
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {showAlertsList ? "Hide Alerts" : "Show Alerts"}
        </button>

        {/* Set Alert */}
        <button
          onClick={() => setShowAlertForm((prev) => !prev)}
          className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100
                     border border-purple-200 rounded-lg hover:bg-purple-200
                     focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {showAlertForm ? "Close" : "Set Alert"}
        </button>

        {/* Favorite Heart */}
        <button
          onClick={handleToggleFavorite}
          className="w-10 h-10 flex items-center justify-center
                     rounded-full bg-red-50 hover:bg-red-100
                     focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          {isToggling ? (
            <img
              src="/heart-empty-icon.svg"
              alt="Removing Favorite..."
              className="w-6 h-6"
            />
          ) : (
            <img
              src="/heart-filled-icon.svg"
              alt="Remove from Favorites"
              className="w-6 h-6"
            />
          )}
        </button>
      </div>

      {showAlertsList && userId && (
        <div className="absolute left-0 top-full mt-0.5 z-10 w-full border border-gray-200 shadow-lg p-4 rounded-lg bg-white/90 backdrop-blur-md max-h-60 overflow-y-auto">
          <LocationAlerts
            userId={userId}
            locationName={name}
            latitude={location.latitude}
            longitude={location.longitude}
          />
        </div>
      )}

      {showAlertForm && userId && (
        <div className="absolute left-0 top-full mt-2 z-20 w-full bg-white border border-purple-200 shadow-lg p-4">
          <AlertForm
            userId={userId}
            latitude={location.latitude}
            longitude={location.longitude}
            locationName={name}
            onAlertCreated={() => setShowAlertForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FavoriteItem;
