import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCurrentWeatherData,
  fetchLocationBasedForecastWeatherData,
} from "../redux/slices/weatherSlice";
import { fetchFavorites, saveFavorite } from "../redux/slices/favoritesSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setError } from "../redux/slices/errorSlice";
import WeatherSummary from "../components/WeatherSummary";
import WeatherForecast from "../components/WeatherForecast";

const WeatherPage: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const weather = useAppSelector((state) => state.weather);
  const user = useAppSelector((state) => state.user);
  const favorites = useAppSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check and Set Favorite
    if (user.isAuthenticated && favorites.data && location) {
      setIsFavorite(
        favorites.data.some((favorite) => favorite.location === location),
      );
    }
  }, [favorites.data, location, user.isAuthenticated]);

  useEffect(() => {
    // Fetch Favorites
    if (
      user.isAuthenticated &&
      favorites.data === null &&
      favorites.status === "idle"
    ) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favorites.data, favorites.status, user.isAuthenticated]);

  useEffect(() => {
    // Fetch Weather Data
    if (weather.currentLocation) {
      dispatch(fetchCurrentWeatherData(weather.currentLocation.name));
      dispatch(
        fetchLocationBasedForecastWeatherData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );
    }
  }, [dispatch, weather.currentLocation]);

  useEffect(() => {
    // Redirect on Invalid Location
    if (!weather.currentLocation && location) {
      navigate("/", { replace: true });
    }
  }, [weather.currentLocation, location]);

  useEffect(() => {
    // Handle Weather Fetch Errors
    if (
      weather.current.status === "failed" ||
      weather.forecast.status === "failed"
    ) {
      dispatch(setError("Error fetching weather data"));
      navigate("/", { replace: true });
    }
  }, [weather.current.status, weather.forecast.status, dispatch, navigate]);

  useEffect(() => {
    // Handle Favorites Fetch Errors
    if (favorites.status === "failed") {
      dispatch(setError("Error fetching weather data"));
    }
  }, [favorites.status]);

  const handleSaveFavorite = () => {
    if (weather.current.data) {
      setIsFavorite(true);
      dispatch(saveFavorite(weather.current.data.location))
        .unwrap()
        .catch(() => {
          setIsFavorite(false);
          dispatch(setError("Failed to save. Please try again later."));
        });
    }
  };

  const isLoading =
    weather.current.status === "loading" ||
    weather.forecast.status === "loading";

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-sm shadow-md">
      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading weather data...</p>
        </div>
      )}

      {!isLoading && weather.current.data && weather.forecast.data && (
        <>
          <WeatherSummary
            location={weather.current.data.location}
            temperature={weather.current.data.temperature}
            humidity={weather.current.data.humidity}
            windSpeed={weather.current.data.windSpeed}
            condition={weather.current.data.condition}
          />

          <WeatherForecast forecastData={weather.forecast.data} />
          {user.isAuthenticated &&
            !isFavorite &&
            favorites.status === "succeeded" && (
              <button
                onClick={handleSaveFavorite}
                className="mt-6 mb-6 px-2 py-1 bg-gray-50 text-gray-700 font-semibold rounded-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 ring-1 ring-gray-200"
              >
                + Favorite
              </button>
            )}
        </>
      )}
    </div>
  );
};

export default WeatherPage;
