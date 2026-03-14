/**
 * Authentication Constants
 * 
 * Contains all authentication-related constants including storage keys,
 * session management, and theme preferences.
 * 
 * @example
 * ```typescript
 * import { AUTH_CONSTANTS } from '@/constants';
 * 
 * // Store authentication token
 * localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
 * 
 * // Check if user is authenticated
 * const isAuthenticated = !!localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
 * 
 * // Clear authentication on logout
 * localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
 * localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
 * ```
 */
export const AUTH_CONSTANTS = {
  /**
   * Storage key for authentication token
   * @example localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY)
   */
  TOKEN_KEY: 'auth_token',
  
  /**
   * Storage key for user data
   * @example localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(user))
   */
  USER_KEY: 'user',
  
  /**
   * Storage key for theme preference
   * @example localStorage.getItem(AUTH_CONSTANTS.THEME_KEY)
   */
  THEME_KEY: 'theme',
  
  /**
   * Session timeout duration in milliseconds (30 minutes)
   * @example
   * if (Date.now() - lastActivity > AUTH_CONSTANTS.SESSION_TIMEOUT_MS) {
   *   // Session expired
   * }
   */
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
} as const;
