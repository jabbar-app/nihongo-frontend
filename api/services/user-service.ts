/**
 * User API Service
 * 
 * Provides methods for user-related API operations including:
 * - Fetching user data
 * - Creating users
 * - Updating user information
 * - Deleting users
 * 
 * @module api/services/user-service
 */

import { BaseService } from './base-service';
import { User } from '@/types/domain/user';

/**
 * User API Service
 * 
 * Encapsulates all user-related API operations with proper error handling
 * and type safety.
 * 
 * @example
 * ```typescript
 * const user = await userService.getUser('123');
 * const newUser = await userService.createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   password: 'password123',
 * });
 * ```
 */
class UserService extends BaseService {
  protected serviceName = 'UserService';

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns User data
   * @throws ApplicationError if user not found or network error
   */
  async getUser(id: string): Promise<User> {
    this.log('getUser', { id });
    return this.get<User>(`/api/users/${id}`, { userId: id });
  }

  /**
   * Get current authenticated user
   * 
   * @returns Current user data
   * @throws ApplicationError if not authenticated or network error
   */
  async getCurrentUser(): Promise<User> {
    this.log('getCurrentUser');
    return this.get<User>('/api/users/me');
  }

  /**
   * Get all users (admin only)
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns List of users
   * @throws ApplicationError if not authorized or network error
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    this.log('getUsers', { page, limit });
    return this.get<{ users: User[]; total: number }>(
      `/api/users?page=${page}&limit=${limit}`,
      { page, limit }
    );
  }

  /**
   * Create a new user
   * 
   * @param data - User creation data
   * @returns Created user
   * @throws ApplicationError if validation fails or network error
   */
  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }): Promise<User> {
    this.log('createUser', { email: data.email });
    return this.post<User>('/api/users', data, {
      email: data.email,
      action: 'create',
    });
  }

  /**
   * Update user information
   * 
   * @param id - User ID
   * @param data - User update data
   * @returns Updated user
   * @throws ApplicationError if user not found or network error
   */
  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      name: string;
      role: string;
      isActive: boolean;
    }>
  ): Promise<User> {
    this.log('updateUser', { id });
    return this.put<User>(`/api/users/${id}`, data, {
      userId: id,
      action: 'update',
    });
  }

  /**
   * Update current user profile
   * 
   * @param data - Profile update data
   * @returns Updated user
   * @throws ApplicationError if validation fails or network error
   */
  async updateProfile(data: Partial<{
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
  }>): Promise<User> {
    this.log('updateProfile');
    return this.put<User>('/api/users/me', data, {
      action: 'updateProfile',
    });
  }

  /**
   * Delete user
   * 
   * @param id - User ID
   * @throws ApplicationError if user not found or network error
   */
  async deleteUser(id: string): Promise<void> {
    this.log('deleteUser', { id });
    await this.delete<void>(`/api/users/${id}`, {
      userId: id,
      action: 'delete',
    });
  }

  /**
   * Change user password
   * 
   * @param id - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @throws ApplicationError if password is incorrect or network error
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    this.log('changePassword', { id });
    await this.post<void>(
      `/api/users/${id}/change-password`,
      { currentPassword, newPassword },
      { userId: id, action: 'changePassword' }
    );
  }

  /**
   * Search users
   * 
   * @param query - Search query
   * @param limit - Maximum results (default: 10)
   * @returns Search results
   * @throws ApplicationError if network error
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    this.log('searchUsers', { query, limit });
    return this.get<User[]>(
      `/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { query, limit }
    );
  }
}

/**
 * Singleton user service instance
 */
export const userService = new UserService();

export default userService;
