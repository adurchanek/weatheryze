import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchAuthSession,
  getCurrentUser,
  signOut,
  AuthUser,
} from "@aws-amplify/auth";
import "aws-amplify/auth/enable-oauth-listener";
import { getCognitoConfig } from "../../config";

interface AuthContextType {
  user: AuthUser | null;
  email: string | null;
  accessToken: string | null;
  refreshUser: () => Promise<void>;
  profile: Profile | null;
  logout: () => Promise<void>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

interface Profile {
  user: AuthUser | null;
  email: string | null;
  picture: string | null;
  name: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const API_URL_REFRESH =
        import.meta.env.MODE === "development"
          ? "/api/v1/backend-service/auth/refresh"
          : `${import.meta.env.VITE_BACKEND_URL}/api/v1/backend-service/auth/refresh`;

      const response = await fetch(API_URL_REFRESH, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const tokens = await response.json();

        localStorage.setItem("accessToken", tokens.access_token);
        setAccessToken(tokens.access_token);

        const API_URL_USER =
          import.meta.env.MODE === "development"
            ? "/api/v1/backend-service/auth/user"
            : `${import.meta.env.VITE_BACKEND_URL}/api/v1/backend-service/auth/user`;

        // Fetch user details from backend
        const userResponse = await fetch(API_URL_USER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: tokens.id_token }),
        });

        const userInfo = await userResponse.json();

        if (userInfo.email) {
          setUser(userInfo);
          setEmail(userInfo.email);
          setProfilePicture(userInfo.profile_picture);
          setProfile({
            user: userInfo,
            name: userInfo.given_name,
            picture: userInfo.profile_picture,
            email: userInfo.email,
          });
          setLoading(false);
          return;
        }
      }

      // If OAuth refresh failed, fallback to Cognito Session
      const session = await fetchAuthSession();
      if (session?.tokens?.accessToken) {
        setAccessToken(session.tokens.accessToken.toString());
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setEmail(currentUser.signInDetails?.loginId ?? null);

        setProfile({
          user: currentUser,
          name: null,
          picture: null,
          email: currentUser.signInDetails?.loginId ?? null,
        });
      } else {
        setUser(null);
        setEmail(null);
        setAccessToken(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      setEmail(null);
      setAccessToken(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out...");
      const { domain, userPoolClientId, redirectSignOut } = getCognitoConfig();

      if (accessToken) {
        console.log("Detected OAuth session, clearing backend tokens...");

        const API_URL_LOGOUT =
          import.meta.env.MODE === "development"
            ? "/api/v1/backend-service/auth/logout"
            : `${import.meta.env.VITE_BACKEND_URL}/api/v1/backend-service/auth/logout`;

        // Call backend to clear refresh token (for Google OAuth users)
        await fetch(API_URL_LOGOUT, {
          method: "POST",
          credentials: "include",
        });
      }

      console.log("Logging out from Cognito...");

      // Amplify logout (for email/password users)
      await signOut();

      // Clear local storage + state
      localStorage.removeItem("accessToken");
      setUser(null);
      setEmail(null);
      setProfilePicture(null);
      setProfile(null);
      setAccessToken(null);

      const encodedRedirectSignOut = encodeURIComponent(`${redirectSignOut}/`);

      window.location.href = `https://${domain}/logout?client_id=${userPoolClientId}&logout_uri=${redirectSignOut}/`;

      console.log("Successfully logged out!");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        accessToken,
        refreshUser,
        profile,
        logout,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
