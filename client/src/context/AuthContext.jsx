import { Loader2 } from "lucide-react";

// Context
import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../requestMethod";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Login - store token and set user data
  const login = async (userData) => {
    try {
      // Extract token from userData
      const { token, ...user } = userData;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set user data in state (everything except token)
      setCurrentUser(user);
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      setCurrentUser(null);
      throw error;
    }
  };

  // Handle Logout
  const logout = async () => {
    try {
      await makeRequest.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove token and clear user data
      localStorage.removeItem("token");
      setCurrentUser(null);
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Get user data from /auth/me endpoint
          const response = await makeRequest.get("/auth/me");

          // Response directly contains user data with token
          if (response.data && response.data._id) {
            const { token: _, ...user } = response.data;
            setCurrentUser(user);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          // If token is invalid, remove it
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      } else {
        // No token, user is not authenticated
        setCurrentUser(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-700 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
