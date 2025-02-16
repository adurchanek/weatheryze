import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  clearWeatherError,
  fetchCurrentAirQualityData,
  fetchCurrentWeatherData,
  fetchDailyConditionData,
  fetchDailyPrecipitationChanceData,
  fetchDailyTemperatureData,
  fetchDailyWeatherData,
  fetchDailyWindData,
  fetchLocationBasedForecastWeatherData,
  fetchLocationBasedWindSpeedWeatherData,
  fetchPrecipitationData,
  setCurrentLocation,
} from "../redux/slices/weatherSlice";
import {
  deleteFavorite,
  fetchFavorites,
  saveFavorite,
} from "../redux/slices/favoritesSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearError, setError } from "../redux/slices/errorSlice";
import WeatherSummary from "../components/summaries/weather-summary/WeatherSummary";
import { fetchLocationByCoordinates } from "../redux/slices/locationSlice";
import Forecast from "../components/weather-charts/Forecast";
import Precipitation from "../components/weather-charts/Precipitation";
import { ScreenSizeProvider } from "../context/ScreenSizeContext";
import AirQuality from "../components/summaries/air-quality-summary/AirQuality";
import WindSpeedSummary from "../components/summaries/wind-summary/WindSpeedSummary";
import WindSpeed from "../components/weather-charts/WindSpeed";
import TemperatureSummary from "../components/summaries/temperature-summary/TemperatureSummary";
import ConditionSummary from "../components/summaries/weather-condition-summary/condition-summary-panel/ConditionSummary";
import { useAuth } from "../context/AuthContext";

const WeatherPage: React.FC = () => {
  const locationIdParam = useParams<{ location: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const weather = useAppSelector((state) => state.weather);

  const currentTemperature =
    weather.currentWeather.data?.weather.temperature || 0;
  const feelsLike =
    weather.currentWeather.data?.weather.apparentTemperature || 0;
  const high = weather.dailyWeather.data
    ? Math.max(
        ...Object.values(weather.dailyWeather.data.daily.temperature2mMax),
      )
    : 0;
  const low = weather.dailyWeather.data
    ? Math.min(
        ...Object.values(weather.dailyWeather.data.daily.temperature2mMin),
      )
    : 0;
  const unit = "°F";

  const { user, profile } = useAuth();
  const favorites = useAppSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(true);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [latitude, longitude] = (locationIdParam.location || "")
    .split(",")
    .map((coord) => (isNaN(Number(coord)) ? null : Number(coord)));
  const [precipitationRange, setPrecipitationRange] = useState("1");
  const [forecastRange, setForecastRange] = useState("1");
  const [windSpeedRange, setWindSpeedRange] = useState("1");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Check and Set Favorite
    if ((user || profile?.user) && favorites.data && locationIdParam.location) {
      setIsFavorite(
        favorites.data.some(
          (favorite) => favorite.locationId === locationIdParam.location,
        ),
      );
    } else {
      setIsFavorite(false);
    }
  }, [favorites.data, locationIdParam.location, user, profile?.user]);

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
      (user || profile?.user) &&
      favorites.data === null &&
      favorites.status === "idle"
    ) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favorites.data, favorites.status, user, profile?.user]);

  useEffect(() => {
    // Handle Favorites Fetch Errors
    if (favorites.status === "failed") {
      dispatch(setError("Error fetching favorites"));
    }
  }, [favorites.status]);

  // Fetch current weather data (unrelated on range)
  useEffect(() => {
    if (weather.currentLocation) {
      dispatch(
        fetchCurrentWeatherData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
          location: weather.currentLocation.name,
        }),
      );

      dispatch(
        fetchCurrentAirQualityData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );

      dispatch(
        fetchDailyWindData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );

      dispatch(
        fetchDailyWeatherData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );

      dispatch(
        fetchDailyPrecipitationChanceData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );

      dispatch(
        fetchDailyConditionData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );

      dispatch(
        fetchDailyTemperatureData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
        }),
      );
    }
  }, [dispatch, weather.currentLocation]);

  // Fetch precipitation data (dependent on range)
  useEffect(() => {
    if (weather.currentLocation) {
      dispatch(
        fetchPrecipitationData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
          range: precipitationRange,
        }),
      );
    }
  }, [dispatch, weather.currentLocation, precipitationRange]);

  // Fetch forecast data (dependent on range)
  useEffect(() => {
    if (weather.currentLocation) {
      dispatch(
        fetchLocationBasedForecastWeatherData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
          range: forecastRange,
        }),
      );
    }
  }, [dispatch, weather.currentLocation, forecastRange]);

  // Fetch windspeed data (dependent on range)
  useEffect(() => {
    if (weather.currentLocation) {
      dispatch(
        fetchLocationBasedWindSpeedWeatherData({
          latitude: weather.currentLocation.latitude,
          longitude: weather.currentLocation.longitude,
          timezone: "auto",
          range: windSpeedRange,
        }),
      );
    }
  }, [dispatch, weather.currentLocation, windSpeedRange]);

  useEffect(() => {
    if (
      weather.currentWeather.status === "failed" ||
      weather.forecast.status === "failed"
    ) {
      dispatch(setError("Error fetching weather data"));
      navigate("/", { replace: true });
    }
  }, [
    weather.currentWeather.status,
    weather.forecast.status,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    // Clear both global and weather-related errors
    dispatch(clearError());
    dispatch(clearWeatherError());
  }, [location, dispatch]);

  const handlePrecipitationRangeChange = (newRange: string) => {
    setPrecipitationRange(newRange);
  };

  const handleForecastRangeChange = (newRange: string) => {
    setForecastRange(newRange);
  };

  const handleWindSpeedRangeChange = (newRange: string) => {
    setWindSpeedRange(newRange);
  };

  const handleToggleFavorite = async () => {
    if (!weather.currentLocation || isRequestPending) {
      return;
    }

    setIsRequestPending(true);

    try {
      if (isFavorite) {
        const favorite = favorites.data?.find(
          (fav) => fav.locationId === weather.currentLocation?.id,
        );

        if (favorite?.id) {
          await dispatch(deleteFavorite(favorite.id)).unwrap();
          setIsFavorite(false);
        } else {
          dispatch(setError("Favorite not found for deletion."));
        }
      } else {
        await dispatch(
          saveFavorite({
            location: weather.currentLocation,
          }),
        ).unwrap();
        setIsFavorite(true);
      }
    } catch (error) {
      const action = isFavorite ? "remove from" : "add to";
      const solution = user || profile?.user ? "try again" : "sign in";
      dispatch(setError(`Unable to ${action} favorites. Please ${solution}.`));
    } finally {
      setIsRequestPending(false); // Allow subsequent requests
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f0f2f9] select-none">
        {/* Spinner */}
        <div className="flex gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen  bg-[#f0f2f9] pb-2">
      {/*Weather Summary Section*/}
      <div className="max mx-auto rounded-3xl lg:flex-col drop-shadow-md lg:mx-10 sm:pt-6 pt-4 ">
        {/* Second Row */}
        <div className="max mx-auto rounded-lg flex flex-col lg:flex-row drop-shadow-sm px-2 sm:px-0 pb-4 sm:pb-0 max-w-screen-2xl">
          {/* Weather Forecast Section */}
          <div className="w-full pb-4 sm:pb-8 sm:px-4 mb-2 sm:mb-0">
            <WeatherSummary
              location={weather.currentLocation?.name || ""}
              currentWeatherSummaryData={weather.currentWeather.data}
              isFavorite={isFavorite}
              handleToggleFavorite={handleToggleFavorite}
              isDisabled={isRequestPending}
              loadingStatus={weather.currentWeather.status}
            />
          </div>

          {/* Air Quality Card */}
          <div className="w-full xl:w-[39%] lg:w-[55%] sm:px-4 pb-0 sm:pb-8">
            <AirQuality
              currentAirQualityData={weather.currentAirQuality.data}
              loadingStatus={weather.currentAirQuality.status}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="max mx-auto rounded-lg flex flex-col lg:flex-row drop-shadow-sm px-2 sm:px-0 max-w-screen-2xl">
          {/* Weather Wind Speed Section */}
          <div className="w-full xl:w-[39%] lg:w-[55%] sm:px-4 pb-4 sm:pb-8">
            <ScreenSizeProvider>
              <TemperatureSummary
                temperatureData={{
                  currentTemperature,
                  feelsLike,
                  high,
                  low,
                  unit,
                }}
                loadingStatus={weather.currentWeather.status}
                dailyTemperatureData={weather.temperatureData.data}
                dailyTemperatureLoadingStatus={weather.temperatureData.status}
              />
            </ScreenSizeProvider>
          </div>

          {/* Weather Forecast Section */}
          <div className="pb-4 sm:pb-8 sm:px-4 w-full">
            <ScreenSizeProvider>
              <Forecast
                forecastData={weather.forecast.data}
                onRangeChange={handleForecastRangeChange}
                range={forecastRange}
                loadingStatus={weather.forecast.status}
              />
            </ScreenSizeProvider>
          </div>
        </div>

        {/* Third Row */}
        <div className="max mx-auto rounded-lg flex flex-col-reverse lg:flex-row drop-shadow-sm px-2 sm:px-0 max-w-screen-2xl">
          {/* Wind Section */}
          <div className="pb-4 sm:pb-8 sm:px-4 w-full">
            <ScreenSizeProvider>
              <WindSpeed
                windSpeedData={weather.windSpeed.data}
                onRangeChange={handleWindSpeedRangeChange}
                range={windSpeedRange}
                loadingStatus={weather.windSpeed.status}
              />
            </ScreenSizeProvider>
          </div>

          {/* Weather Wind Speed Section */}
          <div className="w-full xl:w-[39%] lg:w-[55%] sm:px-4 pb-4 sm:pb-8">
            <ScreenSizeProvider>
              <WindSpeedSummary
                currentWindSpeed={
                  weather.currentWeather.data?.weather.windSpeed
                }
                currentWindDirection={
                  weather.currentWeather.data?.weather.windDirection
                }
                dailyWindData={weather.dailyWind.data}
                currentWeatherLoadingStatus={weather.currentWeather.status}
                dailyWindLoadingStatus={weather.dailyWind.status}
              />
            </ScreenSizeProvider>
          </div>
        </div>

        {/* Fourth Row */}
        <div className="max mx-auto rounded-lg flex flex-col lg:flex-row drop-shadow-sm px-2 sm:px-0 max-w-screen-2xl">
          {/* Weather Wind Speed Section */}
          <div className="w-full xl:w-[39%] lg:w-[55%] sm:px-4 pb-4 sm:pb-8">
            <ScreenSizeProvider>
              <ConditionSummary
                condition={weather.currentWeather.data?.weather.condition || ""}
                loadingStatus={weather.currentWeather.status}
                precipitationChanceData={weather.precipitationChanceData.data}
                conditionData={weather.conditionData.data}
              />
            </ScreenSizeProvider>
          </div>

          {/* Weather Precipitation Section */}
          <div className="pb-4 sm:pb-8 sm:px-4  w-full">
            <ScreenSizeProvider>
              <Precipitation
                precipitationData={weather.precipitation.data}
                onRangeChange={handlePrecipitationRangeChange}
                range={precipitationRange}
                loadingStatus={weather.precipitation.status}
              />
            </ScreenSizeProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
