import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCognitoConfig } from "../../../config";

const API_KEY = getCognitoConfig()?.windyApiKey;

const WindyMap: React.FC = () => {
  useEffect(() => {
    const windyScript = document.createElement("script");
    windyScript.src = "https://api.windy.com/assets/map-forecast/libBoot.js";
    windyScript.async = true;

    windyScript.onload = () => {
      const options = {
        key: API_KEY,
        verbose: true,
        lat: 39.339,
        lon: -94.653,
        zoom: 4,
      };

      (window as any).windyInit(options, (windyAPI: any) => {
        const leafletStyles = `
          .leaflet-control { z-index: 0 !important; }
          .leaflet-pane { z-index: 0 !important; }
          .leaflet-top, .leaflet-bottom { z-index: 0 !important; }
          #windy #logo {
            transform: scale(0.75);
          }
        `;
        const styleTag = document.createElement("style");
        styleTag.innerHTML = leafletStyles;
        document.head.appendChild(styleTag);

        L.popup();
      });
    };

    document.body.appendChild(windyScript);

    return () => {
      document.body.removeChild(windyScript);
      const styleTag = document.querySelector("style");
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, []);

  return (
    <div
      id="windy"
      style={{
        width: "100%",
        height: "100%",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        filter: "drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.1))", // Inline drop shadow
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    />
  );
};

export default WindyMap;
