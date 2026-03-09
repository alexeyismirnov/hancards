import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/register', data);
  },

  /**
   * Login an existing user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/login', data);
  },

  /**
   * Get current user data
   */
  async getCurrentUser(token: string): Promise<{ user: User }> {
    return api.get<{ user: User }>('/api/auth/me', token);
  },
};
