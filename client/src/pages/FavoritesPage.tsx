import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchFavorites, deleteFavorite } from "../redux/slices/favoritesSlice";
import { useNavigate } from "react-router-dom";
import FavoriteItem from "../components/FavoriteItem";

const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteFavorite(id));
  };

  const handleViewWeather = (location: string) => {
    navigate(`/weather/${encodeURIComponent(location)}`);
  };

  if (favorites.status === "loading") {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  if (favorites.status === "failed") {
    return <p className="text-center text-red-500">Error loading favorites.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Your Favorite Locations
      </h1>
      {favorites.data && favorites.data.length > 0 ? (
        <ul className="space-y-4">
          {favorites.data.map((favorite) => (
            <FavoriteItem
              key={favorite._id}
              id={favorite._id}
              location={favorite.location}
              onView={handleViewWeather}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">
          No favorite locations saved.
        </p>
      )}
    </div>
  );
};

export default FavoritesPage;
