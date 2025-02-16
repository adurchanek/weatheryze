import axios from "axios";
import { fetchAuthSession } from "@aws-amplify/auth";
import { getBaseUrl } from "../../config";
import { Store } from "redux";
import { RootState } from "../redux/store";

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

let store: Store<RootState>;

export const setStore = (_store: Store<RootState>) => {
  store = _store;
};

const API_URL =
  import.meta.env.MODE === "development"
    ? "/api/v1/backend-service/auth/refresh"
    : `${import.meta.env.VITE_BACKEND_URL}/api/v1/backend-service/auth/refresh`;
const refreshToken = async (): Promise<string | null> => {
  try {
    // Try refreshing OAuth token first (Google SSO)
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const tokens = await response.json();

      localStorage.setItem("accessToken", tokens.access_token);
      return tokens.access_token;
    }

    // Fallback to Cognito session refresh
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;

      // Only check auth for protected API routes
      const protectedEndpoints = ["/favorites", "/auth/user", "/notifications"];
      const isProtected = protectedEndpoints.some((endpoint) =>
        config.url?.includes(endpoint),
      );

      if (isProtected) {
        // Check if the user has a valid Cognito session
        const session = await fetchAuthSession();
        if (session?.tokens?.idToken) {
          token = session.tokens.idToken.toString();
        }

        // If no Cognito session, check localStorage (Google SSO users)
        if (!token) {
          token = localStorage.getItem("accessToken");
        }

        // If still no token, try to refresh (Google SSO only)
        if (!token) {
          token = await refreshToken();
        }

        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error fetching auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
