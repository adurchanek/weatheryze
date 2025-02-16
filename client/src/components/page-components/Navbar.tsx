import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavbarSearch from "./NavbarSearch";
import useIsSmallScreen from "../../hooks/useIsSmallScreen";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const { user, refreshUser, profile, logout, loading } = useAuth();
  const isSmallScreen = useIsSmallScreen();

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    refreshUser();
  };

  const defaultAvatar = "/default-avatar.png";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md mb-6">
      <div className="lg:mx-24 md:mx-12 mx-0 px-2 md:px-1 py-3 flex items-center sm:justify-between">
        {/* Left side: Logo + Desktop Nav */}
        <div className={`flex items-center space-x-4`}>
          <Link
            to="/"
            className={`flex items-center  ${
              isSearchExpanded && isSmallScreen ? "space-x-0" : "space-x-2"
            }`}
          >
            <img
              src="/icon-3.svg"
              alt="Sun Icon"
              className="w-8 h-8 min-w-[32px]"
            />
            <span
              className={`text-xl font-semibold z-10 bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-blue-400 to-sky-400 hover:text-blue-400 transition-all duration-300 overflow-hidden ${
                isSearchExpanded && isSmallScreen
                  ? "opacity-0 w-0"
                  : "opacity-100 w-auto"
              }`}
            >
              Weatheryze
            </span>
          </Link>

          {/* Desktop Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>

            {user && (
              <Link
                to="/favorites"
                className="text-gray-600 hover:text-gray-900"
              >
                Favorites
              </Link>
            )}
            <Link to="/radars" className="text-gray-600 hover:text-gray-900">
              Radars
            </Link>
          </div>
        </div>

        {/* Right side: Desktop (sm+) */}
        <div className="hidden md:flex items-center space-x-4">
          <NavbarSearch
            onExpand={(expanded) => setIsSearchExpanded(expanded)}
          />

          {!user ? (
            !loading ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-1 bg-green-500 rounded-3xl text-white hover:bg-white hover:text-gray-600 border-2 border-transparent hover:border-green-500 shadow"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded-3xl border-2 border-blue-500 text-gray-600 hover:bg-blue-600 hover:text-white shadow-sm"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="h-9"></div>
            )
          ) : (
            <>
              {/* Show a Logout button + Profile picture */}
              <img
                src={profile?.picture || defaultAvatar}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={handleLogout}
                className="px-2 py-1 border-2 border-gray-600 bg-white text-gray-600 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-500 shadow-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Navbar (< md) */}
        <div className="md:hidden flex items-center justify-between w-full px-2">
          <div
            className={`flex-1 mx-2 transition-all duration-300  ${isSearchExpanded ? "w-full" : "w-auto flex justify-end"}`}
          >
            <NavbarSearch
              onExpand={(expanded) => setIsSearchExpanded(expanded)}
            />
          </div>

          {/* Profile Picture (if logged in) + Hamburger Menu */}
          <div className="flex items-center space-x-2">
            {user && (
              <div className="relative" ref={profileRef}>
                <img
                  src={profile?.picture || defaultAvatar}
                  referrerPolicy="no-referrer"
                  alt="Profile"
                  className={`w-8 h-8 rounded-full cursor-pointer min-w-[32px] ${
                    isSearchExpanded && isSmallScreen
                      ? "opacity-0 w-0 hidden"
                      : "opacity-100 w-auto"
                  }`}
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                />

                {/* Mobile Dropdown with Logout */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-36 bg-white border rounded shadow-md z-50">
                    <button
                      onClick={async () => {
                        await handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`text-gray-600 focus:outline-none focus:ring-2 focus:rounded-sm focus:ring-gray-400 ${
                isSearchExpanded && isSmallScreen
                  ? "opacity-0 w-0 hidden"
                  : "opacity-100 w-auto"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search dropdown (expands below nav) */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-2 pb-2 bg-white shadow transition-all">
          <NavbarSearch
            onExpand={(expanded) => setIsSearchExpanded(expanded)}
          />
        </div>
      )}
      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-500 ease-in-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } z-40`}
      >
        <div className="py-4 flex flex-col space-y-1 px-4">
          {!user && (
            <>
              <Link
                to="/login"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
          <Link
            to="/"
            className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {user && (
            <Link
              to="/favorites"
              className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Favorites
            </Link>
          )}
          <Link
            to="/radars"
            className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={() => setIsMenuOpen(false)}
          >
            Radars
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
