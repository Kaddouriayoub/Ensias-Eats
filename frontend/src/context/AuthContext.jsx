import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login with token (from Microsoft OAuth callback)
  const login = async (token) => {
    try {
      authService.setAuthData(token, null);
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
        authService.setAuthData(token, response.data);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    authService.logout();
  };

  // Update user profile
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      authService.setAuthData(localStorage.getItem('token'), { ...storedUser, ...userData });
    }
  };

  // Complete onboarding
  const completeOnboarding = async (data) => {
    try {
      const response = await authService.completeOnboarding(data);
      if (response.success) {
        updateUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
