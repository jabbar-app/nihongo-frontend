/**
 * Auth Context Types
 * 
 * Type definitions for authentication context.
 */

import { User } from '../domain/user';

/**
 * Auth context type
 */
export interface AuthContextType {
  /** Current authenticated user */
  user: User | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is loading */
  isLoading: boolean;
  /** Authentication error if any */
  error: string | null;
  /** Function to log in */
  login: (email: string, password: string) => Promise<void>;
  /** Function to log out */
  logout: () => void;
  /** Function to register a new user */
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Function to refresh the current user data */
  refreshUser: () => Promise<void>;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  /** User email */
  email: string;
  /** User password */
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  /** User name */
  name: string;
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Password confirmation */
  password_confirmation: string;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  /** Authentication token */
  token: string;
  /** User data */
  user: User;
}
