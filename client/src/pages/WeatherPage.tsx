import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  clearWeatherError,
  fetchCurrentWeatherData,
  fetchLocationBasedForecastWeatherData,
  setCurrentLocation,
} from "../redux/slices/weatherSlice";
import {
  deleteFavorite,
  fetchFavorites,
  saveFavorite,
} from "../redux/slices/favoritesSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearError, setError } from "../redux/slices/errorSlice";
import WeatherSummary from "../components/WeatherSummary";
import WeatherForecast from "../components/WeatherForecast";
import { fetchLocationByCoordinates } from "../redux/slices/locationSlice";

const WeatherPage: React.FC = () => {
  const locationIdParam = useParams<{ location: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const weather = useAppSelector((state) => state.weather);
  const user = useAppSelector((state) => state.user);
  const favorites = useAppSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(true);
  const [isRequestPending, setIsRequestPending] = useState(false);

  const [latitude, longitude] = locationIdParam.location
    ? locationIdParam.location
        .split(",")
        .map((coord) => (isNaN(Number(coord)) ? null : Number(coord)))
    : [null, null];

  useEffect(() => {
    // Check and Set Favorite
    if (user.isAuthenticated && favorites.data && locationIdParam.location) {
      setIsFavorite(
        favorites.data.some(
          (favorite) => favorite.id === locationIdParam.location,
        ),
      );
    } else {
      setIsFavorite(false);
    }
  }, [favorites.data, locationIdParam.location, user.isAuthenticated]);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      dispatch(setError("Invalid location URL."));
      navigate("/", { replace: true });
      return;
    }

    if (
      weather.currentLocation?.latitude !== latitude ||
      weather.currentLocation?.longitude !== longitude
    ) {
      dispatch(fetchLocationByCoordinates({ latitude, longitude }))
        .unwrap()
        .then((location) => {
          dispatch(setCurrentLocation(location)); // Update current location
          dispatch(fetchCurrentWeatherData(location.name));
          dispatch(
            fetchLocationBasedForecastWeatherData({
              latitude: location.latitude,
              longitude: location.longitude,
              timezone: "auto",
            }),
          );
        })
        .catch((error) => {
          const errorMessage =
            typeof error === "string"
              ? error
              : error.response?.data?.message ||
                error.message ||
                "Unknown error occurred";
          dispatch(setError(errorMessage));
          navigate("/", { replace: true });
        });
    }
  }, [latitude, longitude, weather.currentLocation, dispatch, navigate]);

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
    // Handle Favorites Fetch Errors
    if (favorites.status === "failed") {
      dispatch(setError("Error fetching favorites"));
    }
  }, [favorites.status]);

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
    if (
      weather.current.status === "failed" ||
      weather.forecast.status === "failed"
    ) {
      dispatch(setError("Error fetching weather data"));
      navigate("/", { replace: true });
    }
  }, [weather.current.status, weather.forecast.status, dispatch, navigate]);

  useEffect(() => {
    // Clear both global and weather-related errors
    dispatch(clearError());
    dispatch(clearWeatherError());
  }, [location, dispatch]);

  const handleToggleFavorite = async () => {
    if (!weather.currentLocation || isRequestPending) {
      return; // Prevent overlapping requests or handle missing data
    }

    setIsRequestPending(true);

    try {
      if (isFavorite) {
        // Find the corresponding favorite's _id
        const favorite = favorites.data?.find(
          (fav) => fav.id === weather.currentLocation?.id,
        );

        if (favorite?._id) {
          await dispatch(deleteFavorite(favorite._id)).unwrap(); // Use the MongoDB _id
          setIsFavorite(false); // Update local state
        } else {
          dispatch(setError("Favorite not found for deletion."));
        }
      } else {
        await dispatch(
          saveFavorite({
            location: weather.currentLocation,
          }),
        ).unwrap();
        setIsFavorite(true); // Update local state
      }
    } catch (error) {
      const action = isFavorite ? "remove from" : "add to";
      const solution = user.isAuthenticated ? "try again" : "sign in";
      dispatch(setError(`Failed to ${action} favorites. Please ${solution}.`));
    } finally {
      setIsRequestPending(false); // Allow subsequent requests
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 sm:px-4">
      {/* Weather Summary Section */}
      <div className="mb-8 mx-auto">
        {weather.current.status === "loading" ? (
          <div className="animate-pulse" role="status">
            <div className="h-8 bg-gray-300 rounded mb-4 w-3/5 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded mb-4 w-2/5 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded mb-6 w-1/4 mx-auto"></div>
          </div>
        ) : (
          weather.current.data && (
            <WeatherSummary
              location={weather.current.data.location}
              temperature={weather.current.data.temperature}
              humidity={weather.current.data.humidity}
              windSpeed={weather.current.data.windSpeed}
              condition={weather.current.data.condition}
              isFavorite={isFavorite}
              handleToggleFavorite={handleToggleFavorite}
              isDisabled={isRequestPending}
            />
          )
        )}
      </div>

      <div className="max mx-auto border border-gray-200 rounded-lg py-1 px-2 sm:p-4 flex flex-col lg:flex-row">
        {/* Weather Forecast Section */}
        <div className="mx-auto py-1 sm:p-4 w-full">
          {weather.forecast.status === "loading" ? (
            <div className="animate-pulse" role="status">
              <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 sm:rounded-lg"></div>
            </div>
          ) : (
            weather.forecast.data && (
              <>
                <div className="sm:rounded-lg overflow-hidden border-2 sm:shadow-sm shadow-md">
                  <WeatherForecast forecastData={weather.forecast.data} />
                </div>
              </>
            )
          )}
        </div>

        {/* Weather Forecast Section */}
        <div className=" mx-auto py-1 sm:p-4 w-full">
          {weather.forecast.status === "loading" ? (
            <div className="animate-pulse" role="status">
              <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 sm:rounded-lg"></div>
            </div>
          ) : (
            weather.forecast.data && (
              <>
                <div className="sm:rounded-lg overflow-hidden border-2 sm:shadow-sm shadow-md">
                  <WeatherForecast forecastData={weather.forecast.data} />
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
