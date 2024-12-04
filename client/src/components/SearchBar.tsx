import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocationsSuggestionsData } from "../redux/slices/locationSlice";
import { useAppSelector, useAppDispatch } from "../hooks";
import { Location } from "../types/location";
import { clearData, setCurrentLocation } from "../redux/slices/weatherSlice";

const SearchBar: React.FC = () => {
  const [locationInput, setLocationInput] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const searchBarRef = useRef<HTMLFormElement>(null);

  const suggestions = useAppSelector(
    (state) => state.location?.suggestions.data,
  );
  const status = useAppSelector((state) => state.location?.suggestions.status);
  const error = useAppSelector((state) => state.location?.error);

  useEffect(() => {
    dispatch(clearData());
  }, [dispatch]);

  const handleSuggestionClick = (suggestion: Location) => {
    // Dispatch the selected location to the weather slice
    dispatch(setCurrentLocation(suggestion));

    // Navigate to the weather page
    navigate(`/weather/${encodeURIComponent(suggestion.id)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (locationInput.trim() && suggestions) {
      // Use the current suggestions to find the full location data
      const selectedLocation = suggestions[0];

      if (selectedLocation) {
        // Dispatch the selected location
        dispatch(setCurrentLocation(selectedLocation));

        // Navigate to the weather page
        navigate(`/weather/${encodeURIComponent(selectedLocation.id)}`);
      }
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setLocationInput(input);
    setIsDropdownVisible(true); // Show the dropdown on input

    if (input.trim()) {
      dispatch(fetchLocationsSuggestionsData({ query: input, limit: 5 }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form
      onSubmit={handleSearch}
      aria-label="search-form"
      className="relative w-full max-w-4xl flex flex-col sm:flex-row"
      ref={searchBarRef} // Attach ref to the <form>
    >
      <div className="relative w-full">
        <input
          type="text"
          placeholder={"Enter a location"}
          value={locationInput}
          onChange={handleInput}
          aria-label="location-input"
          className="w-full px-4 py-4 border border-gray-200 rounded-t-sm sm:rounded-l-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 hover:border-blue-200 shadow-sm"
        />

        {/* Dropdown */}
        {locationInput && isDropdownVisible && (
          <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10 max-h-40 overflow-y-auto">
            {/* Loading State */}
            {status === "loading" && (
              <div className="px-4 py-2 text-gray-500">Loading...</div>
            )}

            {/* Suggestions List */}
            {status === "succeeded" &&
              suggestions &&
              suggestions.length > 0 && (
                <ul>
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {/* Display the name along with relevant information */}
                      <div>
                        <span className="font-semibold">{suggestion.name}</span>
                        {suggestion.state && (
                          <span className="text-gray-500">
                            , {suggestion.state}
                          </span>
                        )}
                        {suggestion.country && (
                          <span className="text-gray-400">
                            {" "}
                            ({suggestion.country})
                          </span>
                        )}
                      </div>
                      {suggestion.zip && (
                        <div className="text-sm text-gray-400">
                          ZIP: {suggestion.zip}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

            {/* No Suggestions */}
            {status === "succeeded" &&
              (!suggestions || suggestions.length === 0) && (
                <div className="px-4 py-2 text-gray-500">
                  Location not found
                </div>
              )}

            {/* Error State */}
            {status === "failed" && error && (
              <div className="px-4 py-2 text-red-400">{error}</div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="mt-2 sm:mt-0 px-4 py-4 bg-blue-500 text-white font-semibold rounded-b-sm sm:rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 text-sm md:text-base"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
