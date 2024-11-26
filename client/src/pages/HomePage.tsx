import React from "react";
import SearchBar from "../components/SearchBar";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 py-2 px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-purple-400 to-blue-400 drop-shadow-lg text-center">
          Weatheryze
        </h1>
      </div>

      <SearchBar />
    </div>
  );
};

export default HomePage;
