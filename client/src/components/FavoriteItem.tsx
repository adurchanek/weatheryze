import React from "react";

interface FavoriteItemProps {
  id: string;
  location: string;
  onView: (location: string) => void;
  onDelete: (id: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({
  id,
  location,
  onView,
  onDelete,
}) => {
  return (
    <li className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm">
      <span className="text-lg font-medium text-gray-800">{location}</span>
      <div className="flex space-x-2">
        <button
          onClick={() => onView(location)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          View Weather
        </button>
        <button
          onClick={() => onDelete(id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default FavoriteItem;
