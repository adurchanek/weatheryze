import React, { useState } from "react";
import { Location } from "../types/location";

interface FavoriteItemProps {
  _id: string;
  location: Location;
  name: string;
  onView: (location: Location) => void;
  onDelete: (_id: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({
  _id,
  location,
  name,
  onView,
  onDelete,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleFavorite = () => {
    setIsToggling(true);
    onDelete(_id);
  };

  return (
    <li className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border-2 h-24">
      {/* Location Name */}
      <span className="text-lg sm:text-xl font-medium text-gray-800 flex-1 line-clamp-3 overflow-hidden">
        {name}
      </span>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        {/* View Weather Button */}
        <button
          onClick={() => onView(location)}
          className="flex items-center px-4 py-2 text-sm font-medium text-black bg-white border-2 border-blue-400 rounded-lg hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          View
        </button>

        {/* Heart Icon (Favorite Toggle) */}
        <button
          onClick={handleToggleFavorite}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <img
            src={
              isToggling ? "/heart-empty-icon.svg" : "/heart-filled-icon.svg"
            }
            alt={isToggling ? "Unfavoriting..." : "Remove Favorite"}
            className="w-6 h-6"
          />
        </button>
      </div>
    </li>
  );
};

export default FavoriteItem;
