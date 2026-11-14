import { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Check auth status on mount ──────────────────────
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      const userData = data.data?.user || data.user || data.data || data;
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ───────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.data?.accessToken || data.accessToken;
      const userData = data.data?.user || data.user;

      localStorage.setItem('accessToken', token);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData?.name || 'User'}!`);
      return { success: true, data: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ── Register ────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const token = data.data?.accessToken || data.accessToken;
      const userData = data.data?.user || data.user;

      localStorage.setItem('accessToken', token);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return { success: true, data: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ── Logout ──────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
