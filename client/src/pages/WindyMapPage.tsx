import React, { useEffect } from "react";
import WindyMap from "../components/radar-maps/WindyMap";

const WindyMapPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="h-full border shadow-md p-4 sm:p-16">
      <WindyMap />
    </div>
  );
};

export default WindyMapPage;
