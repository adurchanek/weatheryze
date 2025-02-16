import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp } from "@aws-amplify/auth";

const VerifyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const username = location.state?.username;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await confirmSignUp({ username, confirmationCode: code });
      navigate("/login");
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err.message || "Failed to verify account");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Verify Account
        </h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmation Code
            </label>
            <input
              id="code"
              type="text"
              placeholder="Enter code from email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition duration-100 focus:ring-2 focus:ring-blue-400"
          >
            Verify & Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccountPage;
