import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 pt-8">
      <div className="container mx-auto text-center">
        <p className="text-lg font-semibold text-gray-600">Weatheryze</p>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Weatheryze. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center space-x-6">
          <a
            href="#"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
