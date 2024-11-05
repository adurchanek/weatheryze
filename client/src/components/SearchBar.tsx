import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      navigate(`/weather/${encodeURIComponent(location.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      aria-label="search-form"
      className="w-full max-w-lg flex flex-col sm:flex-row"
    >
      <input
        type="text"
        placeholder="Enter a location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="location-input"
        className="flex-grow px-3 py-2 border border-gray-300 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-200 transition duration-200"
      />
      <button
        type="submit"
        className="px-4 py-2 sm:px-6 bg-blue-500 text-white font-semibold rounded-b-lg sm:rounded-r-lg sm:rounded-b-none hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 text-sm md:text-base"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
