import React from "react";
import { Link } from "react-router-dom"; // Import Link from React Router

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 pt-8">
      <div className="container mx-auto text-center">
        <p className="text-lg font-semibold text-gray-600">Weatheryze</p>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Weatheryze. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center space-x-6">
          <Link
            to="/privacy-policy"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Terms of Service
          </Link>
          <Link
            to="/contact"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
