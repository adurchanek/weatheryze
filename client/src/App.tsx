import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  loadUserStart,
  loadUser,
  loadUserFailure,
} from "./redux/slices/userSlice";
import axiosInstance from "./services/axiosInstance";
import { initiateSocketConnection, disconnectSocket } from "./services/socket";
import HomePage from "./pages/HomePage";
import WeatherPage from "./pages/WeatherPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import Navbar from "./components/Navbar";
import ErrorNotification from "./components/ErrorNotification";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (token) {
      dispatch(loadUserStart()); // Start loading
      axiosInstance
        .get("/auth/user")
        .then((response) => {
          dispatch(loadUser(response.data));
        })
        .catch((error) => {
          console.error("Failed to load user:", error);
          dispatch(loadUserFailure()); // Stop loading on failure
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
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <ErrorNotification />
        <main className="flex-grow flex justify-center items-center bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-50">
          <div className="w-full max-w-2xl px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weather/:location" element={<WeatherPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/favorites" element={<FavoritesPage />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
