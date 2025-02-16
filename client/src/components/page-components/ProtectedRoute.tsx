import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await refreshUser();
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f0f2f9] select-none">
        {/* Spinner */}
        <div className="flex gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
