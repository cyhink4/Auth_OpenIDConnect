import { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsAuthenticated(true);
        return true;
      }
      const isValid = await checkAuthStatus();
      setIsAuthenticated(isValid);
      return isValid;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    checkAuthentication
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
