import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, User, CharacterVariant } from '@/services/auth.service';

const TOKEN_KEY = 'hancards_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCharVariant: (variant: CharacterVariant) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Initialize token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser(token);
        setUser(response.user);
      } catch (error) {
        // Token is invalid or expired, clear it
        console.error('Failed to fetch user:', error);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await authService.register({ email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateCharVariant = useCallback(async (variant: CharacterVariant) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await authService.updatePreferences({ charVariant: variant }, token);
    setUser(response.user);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateCharVariant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
