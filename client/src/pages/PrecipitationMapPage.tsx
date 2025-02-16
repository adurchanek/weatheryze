import React, { useEffect } from "react";
import PrecipitationMap from "../components/radar-maps/PrecipitationMap";

const PrecipitationMapPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="h-full border shadow-md p-4 sm:p-16">
      <PrecipitationMap />
    </div>
  );
};

export default PrecipitationMapPage;
