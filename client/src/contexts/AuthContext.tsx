import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, AuthState } from '../types';
import api from '../services/api';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Guard against re-entrant logout calls (e.g. 401 event firing while logout already running)
  const isLoggingOut = useRef(false);

  const restoreSession = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }
    try {
      const res = await api.post<{ user: User }>('/auth/verify-token', { token });
      if (res.success && res.data.user) {
        api.setToken(token);
        setState({ user: res.data.user, token, isAuthenticated: true, isLoading: false });
      } else {
        api.clearToken();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      // Token invalid or server unreachable — clear and let user log in again
      api.clearToken();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  // Stable logout — guarded against re-entrant calls from the 401 event listener
  const logout = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    api.clearToken();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    // Fire and forget — don't await, don't block UI
    api.post('/auth/logout').catch(() => {}).finally(() => {
      isLoggingOut.current = false;
    });
  }, []);

  useEffect(() => {
    restoreSession();
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [restoreSession, logout]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      if (!res.success) throw new Error(res.message || 'Login failed');
      api.setToken(res.data.token);
      setState({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      // Re-throw with a clean, user-friendly message
      const msg = api.extractErrorMessage(err);
      throw new Error(msg);
    }
  };

  const signup = async (email: string, password: string, displayName: string, role = 'fan') => {
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/signup', { email, password, displayName, role });
      if (!res.success) throw new Error(res.message || 'Signup failed');
      api.setToken(res.data.token);
      setState({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const msg = api.extractErrorMessage(err);
      throw new Error(msg);
    }
  };

  const refreshUser = async () => {
    const res = await api.get<User>('/users/me');
    if (res.success) setState(s => ({ ...s, user: res.data }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
