import React, { useEffect, lazy, Suspense, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { initiateSocketConnection, disconnectSocket } from "./services/socket";
import Navbar from "./components/page-components/Navbar";
import ErrorNotification from "./components/page-components/ErrorNotification";
import ProtectedRoute from "./components/page-components/ProtectedRoute";
import Footer from "./components/page-components/Footer";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import { fetchCognitoConfig } from "../config";
import { getAmplifyConfig } from "./amplifyConfig";
import { Amplify } from "aws-amplify";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyAccount = lazy(() => import("./pages/VerifyAccount"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WindyMapPage = lazy(() => import("./pages/WindyMapPage"));
const PrecipitationMapPage = lazy(() => import("./pages/PrecipitationMapPage"));

const App: React.FC = () => {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
};

const AppWithRouter: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchCognitoConfig();
      Amplify.configure(getAmplifyConfig());
      setIsConfigLoaded(true);
    };
    initialize();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("code")) {
      const authCode = searchParams.get("code");
      if (authCode) {
        exchangeCodeForTokens(authCode);
      }
    } else {
      refreshUser();
    }
  }, [location]);

  const getApiUrl = () => {
    if (import.meta.env.MODE === "development") {
      return "/api/v1/backend-service/auth/token";
    }
    return `${import.meta.env.VITE_BACKEND_URL}/api/v1/backend-service/auth/token`;
  };

  const exchangeCodeForTokens = async (authCode: string) => {
    try {
      const response = await axios.post(
        getApiUrl(),
        { code: authCode },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      await fetch("https://api.weatheryze.com/api/v1/backend-service/test", {
        method: "GET",
      });

      const tokens = response.data;

      if (tokens.access_token) {
        localStorage.setItem("accessToken", tokens.access_token);
      }

      await refreshUser();

      navigate("/", { replace: true });

      return tokens;
    } catch (err) {
      console.error("Token exchange failed:", err);
    }
  };

  // useEffect(() => {
  //   initiateSocketConnection();
  //
  //   return () => {
  //     disconnectSocket();
  //   };
  // }, []);

  if (!isConfigLoaded) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f0f2f9] select-none">
        {/* Spinner or Static Icon */}
        <div className="flex gap-4">
          <div
            className={`w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full ${
              location.pathname.includes("weather") ? "" : "animate-spin"
            }`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-300 via-sky-300 to-red-100 select-none">
      <Navbar />
      <ErrorNotification />
      <main className="flex-grow flex justify-center">
        <div className="w-full bg-white shadow-lg">
          <Suspense
            fallback={
              <div className="flex flex-col justify-center items-center min-h-screen bg-[#f0f2f9] select-none">
                {/* Spinner or Static Icon */}
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full ${
                      location.pathname.includes("weather")
                        ? ""
                        : "animate-spin"
                    }`}
                  ></div>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weather/:location" element={<WeatherPage />} />
              <Route path="/radars" element={<WindyMapPage />} />
              <Route path="/precip" element={<PrecipitationMapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/favorites" element={<FavoritesPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
