import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocationsSuggestionsData } from "../redux/slices/locationSlice";
import { useAppSelector, useAppDispatch } from "../hooks";
import { Location } from "../types/location";

const SearchBar: React.FC = () => {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const suggestions: Location[] | null = useAppSelector(
    (state) => state.locations?.suggestions?.data,
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      navigate(`/weather/${encodeURIComponent(location.trim())}`);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setLocation(input);

    if (input.trim()) {
      dispatch(fetchLocationsSuggestionsData({ query: input, limit: 5 }));
    }
  };

  function handleSuggestionClick(suggestion: Location) {
    setLocation(suggestion.name);
    navigate(`/weather/${encodeURIComponent(suggestion.name)}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      aria-label="search-form"
      className="relative w-full max-w-lg flex flex-col sm:flex-row"
    >
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Enter a location"
          value={location}
          onChange={handleInput}
          aria-label="location-input"
          className="w-full px-4 py-2 border border-gray-300 rounded-t-lg sm:rounded-l-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        />
        {suggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 text-white font-semibold rounded-b-lg sm:rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 text-sm md:text-base"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
