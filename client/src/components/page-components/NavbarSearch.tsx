import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks";
import {
  fetchLocationsSuggestionsData,
  clearLocationData,
} from "../../redux/slices/locationSlice";
import { clearWeatherData } from "../../redux/slices/weatherSlice";
import { setError } from "../../redux/slices/errorSlice";
import {
  fetchFavorites,
  saveFavorite,
  deleteFavorite,
} from "../../redux/slices/favoritesSlice";
import { Location } from "../../types/location";
import SuggestionsDropdown from "./SuggestionsDropdown";
import { useAuth } from "../../context/AuthContext";
import useIsSmallScreen from "../../hooks/useIsSmallScreen";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightAllTokens(text: string, userInput: string) {
  const tokens = userInput
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (!tokens.length) return text;
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

interface NavbarSearchProps {
  onExpand?: (expanded: boolean) => void;
  debounceDelay?: number;
}

const NavbarSearch: React.FC<NavbarSearchProps> = ({
  onExpand,
  debounceDelay = 100,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  const { user, profile } = useAuth();
  const favorites = useAppSelector((state) => state.favorites);
  const suggestions = useAppSelector(
    (state) => state.location?.suggestions.data,
  );
  const status = useAppSelector((state) => state.location?.suggestions.status);
  const error = useAppSelector((state) => state.location?.error);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSmallScreen = useIsSmallScreen();

  // Clear weather on mount
  useEffect(() => {
    dispatch(clearWeatherData());
  }, [dispatch]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640 && !isCollapsed) {
        setIsCollapsed(true);
        onExpand?.(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isCollapsed, onExpand]);

  // Fetch favorites if logged in
  useEffect(() => {
    if ((user || profile?.user) && favorites.status === "idle") {
      dispatch(fetchFavorites());
    }
  }, [user, profile?.user, favorites.status, dispatch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);

        if (!isCollapsed) {
          // Only update state if needed to avoid redundant renders
          setIsCollapsed(true);

          // Prevent unnecessary function calls if already false
          if (onExpand) onExpand(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollapsed, onExpand]);

  useEffect(() => {
    onExpand?.(!isCollapsed);
  }, [isCollapsed, onExpand]);

  // Debounce suggestions
  useEffect(() => {
    if (!inputValue.trim()) return;
    const timer = setTimeout(() => {
      dispatch(fetchLocationsSuggestionsData({ query: inputValue, limit: 5 }));
    }, debounceDelay);
    return () => clearTimeout(timer);
  }, [inputValue, dispatch, debounceDelay]);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);

    if (!val.trim()) {
      setShowDropdown(false);
      dispatch(clearLocationData());
    } else {
      setShowDropdown(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (inputValue.trim() && suggestions && suggestions.length > 0) {
      navigate(`/weather/${encodeURIComponent(suggestions[0].id)}`);

      setInputValue("");
      setShowDropdown(false);
      setIsCollapsed(true);
      onExpand?.(false);
    }
  }

  function handleSuggestionClick(sugg: Location) {
    navigate(`/weather/${encodeURIComponent(sugg.id)}`);

    setInputValue("");
    setShowDropdown(false);
    setIsCollapsed(true);
    onExpand?.(false);
  }

  function isFavorited(id: string) {
    return !!favorites.data?.some((fav) => fav.locationId === id);
  }

  async function toggleFavorite(loc: Location) {
    if (!user && !profile?.user) {
      dispatch(setError("You must be logged in to favorite a location."));
      return;
    }
    try {
      const locationId = loc.id;
      if (isFavorited(locationId)) {
        const existing = favorites.data?.find(
          (f) => f.locationId === locationId,
        );
        if (existing?.id) {
          await dispatch(deleteFavorite(existing.id)).unwrap();
        }
      } else {
        await dispatch(saveFavorite({ location: loc })).unwrap();
      }
    } catch {
      dispatch(setError("Failed to update favorite. Please try again."));
    }
  }

  function toggleCollapse() {
    setIsCollapsed((prev) => {
      const newState = !prev;

      if (!newState) {
        setTimeout(() => {
          inputRef.current?.focus(); // Ensure focus after expansion
        }, 10); // Delay to allow DOM update
      }

      return newState;
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative w-full">
        <form
          onSubmit={handleSubmit}
          className={`
                    flex items-center
                    overflow-hidden 
                    transition-all duration-500 ease-in-out
                    min-h-[38px]
                    ${isCollapsed ? "w-auto px-0 justify-end" : "w-full px-2 justify-center"}
                  `}
        >
          {/* Magnifying Glass Icon (always shown) */}
          <button
            type="button"
            onClick={toggleCollapse}
            className={`p-2 text-gray-800 hover:text-gray-600 hover:md:bg-gray-100 md:bg-white rounded-full sm:block ${!isCollapsed ? "hidden" : "block"}`}
          >
            <svg
              className="w-5 h-5 "
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Enter a location"
            value={inputValue}
            onChange={handleInputChange}
            className={`
                      bg-transparent outline-none text-sm
                      ml-1
                      transition-all duration-300 sm:duration-500
                      ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}
                     `}
          />

          {!isCollapsed && isSmallScreen && (
            <button
              type="button"
              className="
              p-2
              text-gray-800
              hover:text-gray-600
              hover:bg-gray-100
              rounded-full
              transition
              duration-300
            "
              onClick={toggleCollapse}
            >
              {/* X icon for small screens */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </button>
          )}

          {!isCollapsed && !isSmallScreen && (
            <button
              type="submit"
              className="
              ml-2
              text-sm
              bg-blue-500
              text-white
              rounded-full
              px-3
              py-1
              hover:bg-blue-600
              transition
              duration-300
            "
            >
              Search
            </button>
          )}
        </form>
        {!isCollapsed && showDropdown && inputValue && (
          <div
            className={`${isSmallScreen ? "fixed top-[55px]" : "absolute top-full mt-0.5"} sm:transform-none sm:left-0 sm:w-full
            left-1/2 transform -translate-x-1/2 w-[90%] bg-white border border-gray-50 rounded-md shadow-lg
            max-h-60 overflow-y-auto z-50 min-h-10`}
          >
            {(status === "succeeded" ||
              status === "loading" ||
              status === "idle") &&
            suggestions?.length ? (
              <SuggestionsDropdown
                suggestions={suggestions}
                locationInput={inputValue}
                isLocationFavorited={isFavorited}
                onSelectSuggestion={handleSuggestionClick}
                onToggleFavorite={toggleFavorite}
                highlightText={highlightAllTokens}
                singleLine={true}
              />
            ) : null}

            {status === "succeeded" &&
              (!suggestions || suggestions.length === 0) && (
                <div className="p-2 text-gray-500">No matches found.</div>
              )}

            {status === "failed" && error && (
              <div className="p-2 text-red-400">{error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarSearch;
