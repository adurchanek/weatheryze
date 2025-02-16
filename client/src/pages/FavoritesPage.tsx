import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchFavorites, deleteFavorite } from "../redux/slices/favoritesSlice";
import { useNavigate } from "react-router-dom";
import FavoriteItem from "../components/page-components/FavoriteItem";
import { clearWeatherData } from "../redux/slices/weatherSlice";
import { Location } from "../types/location";
import { useAuth } from "../context/AuthContext";

const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);
  const navigate = useNavigate();
  const { email } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearWeatherData());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    dispatch(deleteFavorite(id));
  };

  const handleViewWeather = (location: Location) => {
    navigate(`/weather/${encodeURIComponent(location.id)}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f9] sm:px-6 py-8 px-2">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-white border border-neutral-100 shadow-md sm:rounded-lg rounded-md">
        {/* Header */}
        <h1 className="text-4xl font-semibold text-gray-600 mb-6 border-b pb-4 border-neutral-200">
          Favorites
        </h1>

        {/* Content */}
        {favorites.status === "loading" ? (
          /* Skeleton loaders */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg h-36"
              ></div>
            ))}
          </div>
        ) : favorites.status === "failed" ? (
          <p className="text-center text-red-500 my-8">
            Error loading favorites. Please try again later.
          </p>
        ) : favorites.data && favorites.data.length > 0 ? (
          /* Render favorite items */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {favorites.data.map((favorite) => (
              <FavoriteItem
                key={favorite.id}
                id={favorite.id}
                location={{
                  id: favorite.locationId, // the "location" ID
                  latitude: favorite.latitude,
                  longitude: favorite.longitude,
                  name: favorite.name,
                  country: favorite.country,
                  countryCode: favorite.countryCode,
                  state: favorite.state,
                  stateCode: favorite.stateCode,
                  zip: favorite.zip,
                }}
                name={favorite.name}
                onView={handleViewWeather}
                onDelete={handleDelete}
                userId={email}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No favorite locations saved.
            </p>
            <img
              src="/empty-state.svg"
              alt="No favorites"
              className="w-1/3 mx-auto mt-6 shadow-sm"
            />
            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-block px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
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
