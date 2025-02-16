import React from "react";
import { Location } from "../../types/location";

interface SuggestionsDropdownProps {
  suggestions: Location[];
  locationInput: string;
  isLocationFavorited: (locId: string) => boolean;
  onSelectSuggestion: (suggestion: Location) => void;
  onToggleFavorite: (suggestion: Location) => void;
  highlightText: (text: string, userInput: string) => React.ReactNode;
  singleLine?: boolean;
}

const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  suggestions,
  locationInput,
  isLocationFavorited,
  onSelectSuggestion,
  onToggleFavorite,
  highlightText,
  singleLine = false,
}) => {
  return (
    <ul role="list">
      {suggestions.map((suggestion) => {
        const isFav = isLocationFavorited(suggestion.id);
        const cityName = suggestion.name.split(",")[0].trim();
        const stateOrRegion =
          suggestion.countryCode === "US"
            ? suggestion.stateCode
            : suggestion.state;

        // Combine city, stateOrRegion, countryCode
        const cityStateCountry = [
          cityName,
          stateOrRegion,
          suggestion.countryCode,
        ]
          .filter(Boolean)
          .join(", ");

        // Add ZIP if present
        const zipPart = suggestion.zip ? ` ${suggestion.zip}` : "";
        const countryPart = suggestion.country
          ? ` (${suggestion.country})`
          : "";

        const displayString = cityStateCountry + zipPart + countryPart;

        return (
          <li
            key={suggestion.id}
            onClick={() => onSelectSuggestion(suggestion)}
            className={`
              flex items-center
              px-4
              hover:bg-gray-100
              mb-1
              cursor-pointer
              space-x-2
              ${singleLine ? "py-1" : "py-2"}
            `}
          >
            <div
              className={`flex-1 min-w-0 ${singleLine ? "truncate text-sm" : ""}`}
            >
              {highlightText(displayString, locationInput)}
            </div>

            {/* Heart icon button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(suggestion);
              }}
              className="p-2 flex-shrink-0 rounded-full hover:bg-red-50 focus:outline-none"
            >
              {isFav ? (
                <img
                  src="/heart-filled-icon.svg"
                  alt="Unfavorite"
                  className={` ${singleLine ? "w-4 h-4" : "w-5 h-5"}`}
                />
              ) : (
                <img
                  src="/heart-empty-icon.svg"
                  alt="Favorite"
                  className={` ${singleLine ? "w-4 h-4" : "w-5 h-5"}`}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default SuggestionsDropdown;
