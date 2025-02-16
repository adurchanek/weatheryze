import React, { useEffect } from "react";
import SearchBar from "../components/page-components/SearchBar";

const HomePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 py-2 px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 from-20% via-blue-400 via-50%  to-sky-300 to-90% drop-shadow-lg text-center select-none">
          Weatheryze
        </h1>
      </div>
      <SearchBar />
    </div>
  );
};

export default HomePage;
