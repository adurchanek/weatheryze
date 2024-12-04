import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchFavorites, deleteFavorite } from "../redux/slices/favoritesSlice";
import { useNavigate } from "react-router-dom";
import FavoriteItem from "../components/FavoriteItem";
import { clearData, setCurrentLocation } from "../redux/slices/weatherSlice";
import { Location } from "../types/location";

const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearData());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteFavorite(id));
  };

  const handleViewWeather = (location: Location) => {
    dispatch(setCurrentLocation(location));
    navigate(`/weather/${encodeURIComponent(location.id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto p-2 sm:p-6 bg-white shadow-sm border-2 sm:rounded-lg">
        {/* Header Section */}
        <h1 className="text-4xl font-bold text-gray-700 mb-6 border-b pb-4">
          Favorites
        </h1>

        {/* Content Section */}
        {favorites.status === "loading" ? (
          <div className="space-y-4">
            {Array.from({ length: favorites.data?.length || 0 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg h-24 my-2"
                  role="status"
                ></div>
              ),
            )}
          </div>
        ) : favorites.status === "failed" ? (
          <p className="text-center text-red-500">
            Error loading favorites. Please try again later.
          </p>
        ) : favorites.data && favorites.data.length > 0 ? (
          <ul className="space-y-4">
            {favorites.data.map((favorite) => (
              <FavoriteItem
                key={favorite._id}
                _id={favorite._id}
                location={favorite}
                name={favorite.name}
                onView={handleViewWeather}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              No favorite locations saved.
            </p>
            <img
              src="/../public/empty-state.svg"
              alt="No favorites"
              className="w-1/3 mx-auto mt-6 shadow-sm"
            />
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Add Your First Favorite
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
