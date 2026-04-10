import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("meetra_token");
    const storedUser = localStorage.getItem("meetra_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        localStorage.removeItem("meetra_token");
        localStorage.removeItem("meetra_user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("meetra_token", tokenData);
    localStorage.setItem("meetra_user", JSON.stringify(userData));
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("meetra_token");
    localStorage.removeItem("meetra_user");
    setError(null);
  }, []);

  const setAuthError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("meetra_user", JSON.stringify(userData));
  }, []);

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    setAuthError,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
