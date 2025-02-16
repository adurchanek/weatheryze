import React, { useEffect, useState } from "react";
import { signIn } from "@aws-amplify/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCognitoConfig } from "../../config";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { refreshUser, setLoading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoogleLogin = () => {
    const { domain, userPoolClientId, redirectSignIn } = getCognitoConfig();

    const encodedRedirectSignIn = encodeURIComponent(`${redirectSignIn}/`);

    window.location.href = `https://${domain}/login?client_id=${userPoolClientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodedRedirectSignIn}`;
    setLoading(true);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await signIn({ username: email, password });

      await refreshUser();

      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid email or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Login
        </h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Email/Password Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg shadow-md hover:scale-105 transition duration-100 focus:ring-2 focus:ring-blue-400"
          >
            Login
          </button>
        </form>

        {/* Google Sign-In Button */}
        <div className="mt-4 text-center text-sm text-gray-600">or</div>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full mt-3 py-2 px-4 border border-gray-300 rounded-lg shadow-md bg-white text-gray-700 font-medium hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-5 h-5 mr-2 bg-white rounded-full"
          />
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
