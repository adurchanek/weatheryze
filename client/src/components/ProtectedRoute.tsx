import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl font-semibold text-gray-600">Loading...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
