/**
 * Authentication API Service
 * 
 * Provides methods for authentication operations including:
 * - Login
 * - Logout
 * - Registration
 * - Token refresh
 * - Password reset
 * 
 * @module api/services/auth-service
 */

import { BaseService } from './base-service';
import { User } from '@/types/domain/user';
import { AUTH_CONSTANTS } from '@/constants/auth';

/**
 * Login response from API
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

/**
 * Registration response from API
 */
export interface RegisterResponse {
  token: string;
  user: User;
}

/**
 * Authentication API Service
 * 
 * Encapsulates all authentication-related API operations with proper
 * error handling and token management.
 * 
 * @example
 * ```typescript
 * const response = await authService.login('user@example.com', 'password');
 * localStorage.setItem('auth_token', response.token);
 * ```
 */
class AuthService extends BaseService {
  protected serviceName = 'AuthService';

  /**
   * Login with email and password
   * 
   * @param email - User email
   * @param password - User password
   * @returns Login response with token and user data
   * @throws ApplicationError if credentials are invalid or network error
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    this.log('login', { email });
    return this.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
  }

  /**
   * Register new user
   * 
   * @param email - User email
   * @param password - User password
   * @param name - User name
   * @returns Registration response with token and user data
   * @throws ApplicationError if validation fails or user exists
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResponse> {
    this.log('register', { email });
    return this.post<RegisterResponse>('/api/auth/register', {
      email,
      password,
      name,
    });
  }

  /**
   * Logout current user
   * 
   * @throws ApplicationError if network error
   */
  async logout(): Promise<void> {
    this.log('logout');
    try {
      await this.post<void>('/api/auth/logout');
    } catch (error) {
      // Log error but don't throw - logout should always clear local state
      this.log('logout error', { error: String(error) });
    }
  }

  /**
   * Refresh authentication token
   * 
   * @param refreshToken - Refresh token
   * @returns New token
   * @throws ApplicationError if refresh token is invalid or expired
   */
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    this.log('refreshToken');
    return this.post<{ token: string }>('/api/auth/refresh', {
      refreshToken,
    });
  }

  /**
   * Request password reset
   * 
   * @param email - User email
   * @throws ApplicationError if email not found or network error
   */
  async requestPasswordReset(email: string): Promise<void> {
    this.log('requestPasswordReset', { email });
    await this.post<void>('/api/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @throws ApplicationError if token is invalid or expired
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.log('resetPassword');
    await this.post<void>('/api/auth/reset-password', {
      token,
      newPassword,
    });
  }

  /**
   * Verify email with token
   * 
   * @param token - Email verification token
   * @throws ApplicationError if token is invalid or expired
   */
  async verifyEmail(token: string): Promise<void> {
    this.log('verifyEmail');
    await this.post<void>('/api/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   * 
   * @param email - User email
   * @throws ApplicationError if email not found or network error
   */
  async resendVerificationEmail(email: string): Promise<void> {
    this.log('resendVerificationEmail', { email });
    await this.post<void>('/api/auth/resend-verification', { email });
  }

  /**
   * Check if token is valid
   * 
   * @param token - Authentication token
   * @returns True if token is valid
   */
  async validateToken(token: string): Promise<boolean> {
    this.log('validateToken');
    try {
      await this.get<{ valid: boolean }>('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current session info
   * 
   * @returns Session information
   * @throws ApplicationError if not authenticated
   */
  async getSession(): Promise<{ user: User; expiresAt: string }> {
    this.log('getSession');
    return this.get<{ user: User; expiresAt: string }>('/api/auth/session');
  }

  /**
   * Enable two-factor authentication
   * 
   * @returns QR code and backup codes
   * @throws ApplicationError if network error
   */
  async enableTwoFactor(): Promise<{ qrCode: string; backupCodes: string[] }> {
    this.log('enableTwoFactor');
    return this.post<{ qrCode: string; backupCodes: string[] }>(
      '/api/auth/2fa/enable'
    );
  }

  /**
   * Verify two-factor authentication code
   * 
   * @param code - 2FA code
   * @throws ApplicationError if code is invalid
   */
  async verifyTwoFactor(code: string): Promise<void> {
    this.log('verifyTwoFactor');
    await this.post<void>('/api/auth/2fa/verify', { code });
  }

  /**
   * Disable two-factor authentication
   * 
   * @param password - User password for confirmation
   * @throws ApplicationError if password is incorrect
   */
  async disableTwoFactor(password: string): Promise<void> {
    this.log('disableTwoFactor');
    await this.post<void>('/api/auth/2fa/disable', { password });
  }
}

/**
 * Singleton auth service instance
 */
export const authService = new AuthService();

export default authService;
