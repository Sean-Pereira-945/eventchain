import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { storage } from '../utils/storage';
import { parseAPIError } from '../utils/errorHandling';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { showNotification } = useNotifications();
  const [user, setUser] = useState(() => storage.get('user'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const hasTokens = storage.get('accessToken');
      if (!user && hasTokens) {
        try {
          setLoading(true);
          const { data } = await authService.getProfile();
          setUser(data.data.user);
        } catch (error) {
          authService.clearAuth();
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    initialize();
  }, [user]);

  const login = useCallback(async (formData) => {
    try {
      setLoading(true);
      const response = await authService.login(formData);
      setUser(response.data.user);
      showNotification({ type: 'success', title: 'Welcome back!', message: 'You are now logged in.' });
      return response;
    } catch (error) {
      const message = parseAPIError(error);
      showNotification({ type: 'error', title: 'Login failed', message });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const register = useCallback(async (formData) => {
    try {
      setLoading(true);
      await authService.register(formData);
      showNotification({
        type: 'success',
        title: 'Registration successful',
        message: 'Check your email to verify your account.'
      });
    } catch (error) {
      const message = parseAPIError(error);
      showNotification({ type: 'error', title: 'Registration failed', message });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      authService.clearAuth();
      setUser(null);
      showNotification({ type: 'info', title: 'Logged out', message: 'You have been signed out.' });
    }
  }, [showNotification]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data.data.user);
    } catch (error) {
      console.error('Profile refresh failed', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile
    }),
    [user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
