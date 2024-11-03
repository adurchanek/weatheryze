import React from "react";
import SearchBar from "../components/SearchBar";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-14 py-2">
      <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-purple-400 to-blue-400 drop-shadow-lg">
        Weatheryze
      </h1>
      <SearchBar />
    </div>
  );
};

export default HomePage;
