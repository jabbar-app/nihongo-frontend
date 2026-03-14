/**
 * Base Service Class
 * 
 * Provides common functionality for all API services including:
 * - Error handling
 * - Type mapping
 * - Request/response logging
 * 
 * @module api/services/base-service
 */

import { apiClient } from '@/api/client';
import { ApplicationError, isApplicationError } from '@/types/errors';
import { errorLogger } from '@/lib/error-logger';

/**
 * Base service class for all API services
 * 
 * Provides common methods and error handling for API operations.
 */
export abstract class BaseService {
  /**
   * Service name for logging
   */
  protected abstract serviceName: string;

  /**
   * Make GET request
   */
  protected async get<T>(endpoint: string, context?: Record<string, unknown>): Promise<T> {
    try {
      return await apiClient.get<T>(endpoint);
    } catch (error) {
      this.handleError(error, 'GET', endpoint, context);
      throw error;
    }
  }

  /**
   * Make POST request
   */
  protected async post<T>(
    endpoint: string,
    body?: any,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await apiClient.post<T>(endpoint, body);
    } catch (error) {
      this.handleError(error, 'POST', endpoint, context);
      throw error;
    }
  }

  /**
   * Make PUT request
   */
  protected async put<T>(
    endpoint: string,
    body?: any,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await apiClient.put<T>(endpoint, body);
    } catch (error) {
      this.handleError(error, 'PUT', endpoint, context);
      throw error;
    }
  }

  /**
   * Make PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    body?: any,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await apiClient.patch<T>(endpoint, body);
    } catch (error) {
      this.handleError(error, 'PATCH', endpoint, context);
      throw error;
    }
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await apiClient.delete<T>(endpoint);
    } catch (error) {
      this.handleError(error, 'DELETE', endpoint, context);
      throw error;
    }
  }

  /**
   * Handle errors from API calls
   */
  protected handleError(
    error: unknown,
    method: string,
    endpoint: string,
    context?: Record<string, unknown>
  ): void {
    if (isApplicationError(error)) {
      errorLogger.error(error, {
        service: this.serviceName,
        method,
        endpoint,
        ...context,
      });
    } else {
      errorLogger.error(error, {
        service: this.serviceName,
        method,
        endpoint,
        ...context,
      });
    }
  }

  /**
   * Log service action
   */
  protected log(action: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.serviceName}] ${action}`, context);
    }
  }
}
