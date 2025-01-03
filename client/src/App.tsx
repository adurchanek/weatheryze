import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  loadUserStart,
  loadUser,
  loadUserFailure,
} from "./redux/slices/userSlice";
import axiosInstance from "./services/axiosInstance";
import { initiateSocketConnection, disconnectSocket } from "./services/socket";
import Navbar from "./components/Navbar";
import ErrorNotification from "./components/ErrorNotification";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (token) {
      dispatch(loadUserStart());
      axiosInstance
        .get("/auth/user")
        .then((response) => {
          dispatch(loadUser(response.data));
        })
        .catch((error) => {
          console.error("Failed to load user:", error);
          dispatch(loadUserFailure());
        });
    }
  }, [dispatch, token]);

  useEffect(() => {
    initiateSocketConnection();

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50">
        <Navbar />
        <ErrorNotification />
        <main className="flex-grow flex justify-center">
          <div className="w-full bg-gradient-to-br from-blue-50 to-white  shadow-lg">
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <div className="text-blue-500 font-bold text-lg">
                    Loading...
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/weather/:location" element={<WeatherPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/favorites" element={<FavoritesPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
