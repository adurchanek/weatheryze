import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchLocationsSuggestionsData,
  clearLocationData,
} from "../../redux/slices/locationSlice";
import { clearWeatherData } from "../../redux/slices/weatherSlice";
import {
  fetchFavorites,
  saveFavorite,
  deleteFavorite,
} from "../../redux/slices/favoritesSlice";
import { setError } from "../../redux/slices/errorSlice";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { Location } from "../../types/location";
import { useAuth } from "../../context/AuthContext";

import SuggestionsDropdown from "./SuggestionsDropdown";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightAllTokens(text: string, userInput: string) {
  const tokens = userInput
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (!tokens.length) return text; // no user tokens to highlight

  const pattern = tokens.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            className="bg-sky-200 rounded-sm shadow drop-shadow-sm"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

interface SearchBarProps {
  debounceDelay?: number;
}

const SearchBar = ({ debounceDelay = 250 }: SearchBarProps) => {
  const [locationInput, setLocationInput] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const searchBarRef = useRef<HTMLFormElement>(null);

  const favorites = useAppSelector((state) => state.favorites);
  const suggestions = useAppSelector(
    (state) => state.location?.suggestions.data,
  );
  const status = useAppSelector((state) => state.location?.suggestions.status);
  const error = useAppSelector((state) => state.location?.error);

  const { user, profile } = useAuth();

  const searchIcon = "/search.png";

  // Clear weather on mount
  useEffect(() => {
    dispatch(clearWeatherData());
  }, [dispatch]);

  // Fetch favorites if logged in
  useEffect(() => {
    if ((user || profile?.user) && favorites.status === "idle") {
      dispatch(fetchFavorites());
    }
  }, [user, profile?.user, favorites.status, dispatch]);

  // Hide dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle input changes
  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocationInput(val);
    setIsDropdownVisible(true);
    if (!val.trim()) {
      setIsDropdownVisible(false);
      dispatch(clearLocationData());
    }
  }

  // Debounce search calls
  useEffect(() => {
    if (!locationInput.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      dispatch(
        fetchLocationsSuggestionsData({ query: locationInput, limit: 5 }),
      );
    }, debounceDelay);

    return () => clearTimeout(delayDebounceFn);
  }, [locationInput, dispatch, debounceDelay]);

  // On form submit, use the first suggestion
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (locationInput.trim() && suggestions && suggestions.length > 0) {
      navigate(`/weather/${encodeURIComponent(suggestions[0].id)}`);
    }
  }

  // Navigate when user clicks a suggestion
  function handleSuggestionClick(suggestion: Location) {
    navigate(`/weather/${encodeURIComponent(suggestion.id)}`);
  }

  // Check if location is favorited
  function isLocationFavorited(locId: string) {
    return !!favorites.data?.some((fav) => fav.locationId === locId);
  }

  // Toggle favorite
  async function toggleFavorite(suggestion: Location) {
    if (!user && !profile?.user) {
      dispatch(setError("You must be logged in to favorite a location."));
      return;
    }
    try {
      const locationId = suggestion.id;
      const alreadyFav = isLocationFavorited(locationId);
      if (alreadyFav) {
        const existing = favorites.data?.find(
          (f) => f.locationId === locationId,
        );
        if (existing?.id) {
          await dispatch(deleteFavorite(existing.id)).unwrap();
        }
      } else {
        await dispatch(saveFavorite({ location: suggestion })).unwrap();
      }
    } catch {
      dispatch(setError("Failed to update favorite. Please try again."));
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      ref={searchBarRef}
      className="relative w-full max-w-4xl flex flex-col sm:flex-row gap-2 sm:gap-0
                 items-center bg-gradient-to-br from-purple-50 via-blue-50 to-sky-50 backdrop-blur-md
                 sm:rounded-full rounded-lg sm:px-2.5 sm:py-2 px-1.5 py-1.5  shadow-sm sm:shadow-sm sm:border sm:border-gray-50"
      aria-label="search-form"
    >
      <div className="relative w-full sm:mr-2 shadow-md rounded-full">
        <input
          type="text"
          placeholder="Enter a location"
          value={locationInput}
          onChange={handleInput}
          className="w-full rounded-lg sm:rounded-full border-none bg-white/80
                     px-4 py-3 pr-12 text-sm md:text-base
                      text-gray-700 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     transition duration-200"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <img
            src={searchIcon}
            alt="Search"
            className="sm:w-8 sm:h-8 w-6 h-6"
          />
        </div>

        {/* Dropdown */}
        {locationInput && isDropdownVisible && (
          <div
            className="absolute left-0 mt-2 w-full
                       bg-white/90 backdrop-blur-sm border border-blue-100
                       rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto min-h-12"
          >
            {/* Suggestions */}
            {(status === "succeeded" ||
              status === "loading" ||
              status === "idle") &&
              suggestions &&
              suggestions.length > 0 && (
                <SuggestionsDropdown
                  suggestions={suggestions}
                  locationInput={locationInput}
                  isLocationFavorited={isLocationFavorited}
                  onSelectSuggestion={handleSuggestionClick}
                  onToggleFavorite={toggleFavorite}
                  highlightText={highlightAllTokens}
                />
              )}

            {/* No suggestions */}
            {status === "succeeded" &&
              (!suggestions || suggestions.length === 0) && (
                <div className="px-4 py-2 text-gray-500 mb-1">
                  Location not found
                </div>
              )}

            {/* Error */}
            {status === "failed" && error && (
              <div className="px-4 py-2 mb-1 text-red-400">{error}</div>
            )}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="mt-0 inline-flex items-center justify-center
                   bg-gradient-to-r from-blue-400 to-blue-500
                   text-white font-semibold sm:rounded-full rounded-lg
                   px-4 py-3 hover:opacity-90 transition-opacity
                   focus:outline-none focus:ring-4 focus:ring-blue-300
                   text-sm md:text-base shadow-inner w-full sm:w-32"
      >
        <span>Search</span>
      </button>
    </form>
  );
};

export default SearchBar;
