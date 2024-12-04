import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks";
import { logout } from "../redux/slices/userSlice";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-2 md:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon-3.svg" alt="Sun Icon" className="w-8 h-8" />{" "}
            <span
              className="text-xl font-semibold bg-clip-text
            text-transparent bg-gradient-to-br from-blue-400 via-purple-400
            to-indigo-400 drop-shadow-lg text-center hover:text-purple-400"
            >
              Weatheryze
            </span>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {user.isAuthenticated && (
              <Link
                to="/favorites"
                className="text-gray-600 hover:text-gray-900"
              >
                Favorites
              </Link>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {user.isAuthenticated ? (
            <>
              <span className="text-gray-600">
                Welcome,{" "}
                <span className="text-gray-400 font-bold italic">
                  {user.userInfo?.name}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-gray-600 text-white rounded-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-green-500 text-white rounded-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Menu for Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white shadow-lg py-4 flex flex-col space-y-2 items-start px-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {user.isAuthenticated && (
            <Link
              to="/favorites"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Favorites
            </Link>
          )}
          {user.isAuthenticated ? (
            <>
              <span className="text-gray-600">
                Welcome,{" "}
                <span className="text-gray-400 font-bold italic">
                  {user.userInfo?.name}
                </span>
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="px-3 py-1 bg-gray-700 text-white rounded-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
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
