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
      className="w-full max-w-3xl flex"
    >
      <input
        type="text"
        placeholder="Enter a location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="location-input"
        className="flex-grow px-6 py-3 border border-gray-300 rounded-l-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-200 transition duration-200"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 text-lg"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
