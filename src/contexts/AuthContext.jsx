import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  });

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  });

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Note: The actual setting of localStorage is usually done in the LoginView
    // or we can centralize it here if we pass token too, but for now we trust
    // LoginView already set the storage or we set it here.
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
