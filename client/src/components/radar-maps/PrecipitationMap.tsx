import React from "react";

const PrecipitationMap: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <iframe
        src="https://www.rainviewer.com/map.html?loc=42.8044,-73.836,8.2653922399624&oCS=1&oAP=1&c=3&o=83&lm=1&layer=radar&sm=1&sn=1"
        width="100%"
        height="100%"
        allowFullScreen
        frameBorder="0"
        title="RainViewer Map"
        style={{
          width: "100%",
          height: "125%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
          filter: "drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.1))",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      />
    </div>
  );
};

export default PrecipitationMap;
