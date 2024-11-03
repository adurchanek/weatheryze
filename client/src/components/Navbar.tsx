import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks";
import { logout } from "../redux/slices/userSlice";

const Navbar: React.FC = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-xl font-semibold text-blue-600 hover:text-blue-700"
          >
            Weatheryze
          </Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          {user.isAuthenticated && (
            <Link to="/favorites" className="text-gray-700 hover:text-gray-900">
              Favorites
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user.isAuthenticated ? (
            <>
              <span className="text-gray-700">
                Welcome, {user.userInfo?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
