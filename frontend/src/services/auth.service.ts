import { api } from '@/lib/api';

export type CharacterVariant = 'simplified' | 'traditional';

export interface User {
  id: string;
  email: string;
  charVariant: CharacterVariant;
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

export interface UpdatePreferencesInput {
  charVariant: CharacterVariant;
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

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesInput, token: string): Promise<{ user: User }> {
    return api.patch<{ user: User }>('/api/auth/preferences', data, token);
  },
};
