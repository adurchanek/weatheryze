interface WeatherSummaryProps {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  isFavorite: boolean;
  handleToggleFavorite: () => void;
  isDisabled: boolean;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({
  location,
  temperature,
  humidity,
  windSpeed,
  condition,
  isFavorite,
  handleToggleFavorite,
  isDisabled,
}) => {
  return (
    <div
      className="relative p-3 sm:p6 sm:rounded-lg shadow-sm bg-white border-gray-100 border-2"
      aria-label="weather-summary"
    >
      {/* Heart Icon */}
      <div className="sticky top-4 flex justify-end">
        <button
          aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          onClick={handleToggleFavorite}
          disabled={isDisabled}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow focus:outline-none ${
            isDisabled
              ? "opacity-75"
              : isFavorite
                ? "bg-red-100"
                : "hover:bg-red-200 bg-red-100"
          }`}
        >
          <img
            src={
              isFavorite ? "/heart-filled-icon.svg" : "/heart-empty-icon.svg"
            }
            alt={isFavorite ? "Remove Favorite" : "Add Favorite"}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Weather Summary */}
      <div className="flex items-end sm:space-x-12">
        <img
          src="/weather-icon-6.svg"
          alt="Weather Icon"
          className="w-16 h-16 sm:w-24 sm:h-24"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {location || "Unknown Location"}
          </h1>
          <p className="px-6  text-gray-500 text-base sm:text-lg mt-3">
            {condition}, {temperature}°C
          </p>
          <p className="px-6  text-sm text-gray-500 mt-1 mb-4">
            Humidity: {humidity}% | Wind Speed: {windSpeed} km/h
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherSummary;
