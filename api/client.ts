/**
 * Enhanced API Client
 * 
 * Provides centralized HTTP client with:
 * - Automatic authentication header injection
 * - Standardized error handling
 * - Request/response interceptors
 * - Retry logic with exponential backoff
 * - Request/response logging
 * 
 * @module api/client
 */

import { API_CONSTANTS } from '@/constants/api';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import {
  ApplicationError,
  ErrorCategory,
  isApplicationError,
} from '@/types/errors';
import { errorLogger } from '@/lib/error-logger';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Request interceptor configuration
 */
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

/**
 * Response interceptor configuration
 */
export interface ResponseInterceptor<T> {
  (response: ApiResponse<T>): ApiResponse<T> | Promise<ApiResponse<T>>;
}

/**
 * Error interceptor configuration
 */
export interface ErrorInterceptor {
  (error: ApplicationError): ApplicationError | Promise<ApplicationError>;
}

/**
 * Request configuration
 */
export interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Enhanced API Client with interceptors and error handling
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<any>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config?: {
    baseUrl?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }) {
    this.baseUrl =
      config?.baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      API_CONSTANTS.DEFAULT_BASE_URL;
    this.timeout = config?.timeout || API_CONSTANTS.TIMEOUT_MS;
    this.retryAttempts = config?.retryAttempts || API_CONSTANTS.RETRY_ATTEMPTS;
    this.retryDelay = config?.retryDelay || 1000; // Default retry delay
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Execute request interceptors
   */
  private async executeRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Execute response interceptors
   */
  private async executeResponseInterceptors<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Execute error interceptors
   */
  private async executeErrorInterceptors(
    error: ApplicationError
  ): Promise<ApplicationError> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Build request headers with authentication
   */
  private getHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request ID for tracking
    headers['X-Request-ID'] = this.generateRequestId();

    return headers;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${path}`;
  }

  /**
   * Handle API errors and convert to ApplicationError
   */
  private handleError(
    status: number,
    statusText: string,
    data?: any
  ): ApplicationError {
    let category = ErrorCategory.SERVER;
    let recoveryAction: 'retry' | 'refresh' | 'login' | 'navigate' | undefined;

    if (status === 400) {
      category = ErrorCategory.VALIDATION;
    } else if (status === 401) {
      category = ErrorCategory.AUTHENTICATION;
      recoveryAction = 'login';
    } else if (status === 403) {
      category = ErrorCategory.AUTHORIZATION;
    } else if (status === 404) {
      category = ErrorCategory.NOT_FOUND;
    } else if (status === 409) {
      category = ErrorCategory.CONFLICT;
      recoveryAction = 'refresh';
    } else if (status >= 500) {
      category = ErrorCategory.SERVER;
      recoveryAction = 'retry';
    }

    const message = data?.message || statusText || 'An error occurred';
    const code = data?.code || `HTTP_${status}`;

    return new ApplicationError({
      category,
      message,
      code,
      statusCode: status,
      details: data?.details || data,
      recoveryAction,
    });
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = this.retryAttempts,
    baseDelay: number = this.retryDelay
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === maxAttempts - 1) {
          break;
        }

        // Don't retry on non-retryable errors
        if (isApplicationError(error)) {
          if (
            error.category === ErrorCategory.VALIDATION ||
            error.category === ErrorCategory.AUTHENTICATION ||
            error.category === ErrorCategory.AUTHORIZATION
          ) {
            throw error;
          }
        }

        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * delay * 0.1;
        await new Promise((resolve) =>
          setTimeout(resolve, delay + jitter)
        );
      }
    }

    throw lastError;
  }

  /**
   * Make HTTP request with full error handling and interceptors
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const requestId = this.generateRequestId();

    try {
      // Get authentication token
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY)
          : null;

      // Build request config
      let requestConfig: RequestConfig = {
        ...config,
        headers: {
          ...this.getHeaders(token),
          ...config.headers,
        },
        timeout: config.timeout || this.timeout,
      };

      // Execute request interceptors
      requestConfig = await this.executeRequestInterceptors(requestConfig);

      // Make request with retry logic
      const response = await this.retryWithBackoff(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            requestConfig.timeout || this.timeout
          );

          try {
            const res = await fetch(url, {
              ...requestConfig,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return res;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        },
        config.retryAttempts || this.retryAttempts,
        config.retryDelay || this.retryDelay
      );

      // Handle authentication errors
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONSTANTS.USER_KEY || 'user');
          window.location.href = ROUTES.AUTH.LOGIN;
        }
        throw new ApplicationError({
          category: ErrorCategory.AUTHENTICATION,
          message: 'Your session has expired. Please log in again.',
          code: 'AUTH_SESSION_EXPIRED',
          statusCode: 401,
          recoveryAction: 'login',
        });
      }

      // Handle error responses
      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }

        const error = this.handleError(
          response.status,
          response.statusText,
          errorData
        );

        // Execute error interceptors
        const processedError = await this.executeErrorInterceptors(error);

        // Log error
        errorLogger.error(processedError, {
          url,
          method: requestConfig.method || 'GET',
          requestId,
          statusCode: response.status,
        });

        throw processedError;
      }

      // Handle no content response
      if (response.status === 204) {
        return {} as T;
      }

      // Parse response
      let responseData: any;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      // Wrap response
      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status,
      };

      // Execute response interceptors
      const processedResponse = await this.executeResponseInterceptors(
        apiResponse
      );

      // Log successful request
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${requestConfig.method || 'GET'} ${url}`, {
          status: response.status,
          requestId,
        });
      }

      return processedResponse.data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new ApplicationError({
          category: ErrorCategory.NETWORK,
          message: 'Network error occurred. Please check your connection.',
          code: 'NETWORK_ERROR',
          recoveryAction: 'retry',
        });

        errorLogger.error(networkError, {
          url,
          method: config.method || 'GET',
          requestId,
          originalError: error.message,
        });

        throw networkError;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApplicationError({
          category: ErrorCategory.NETWORK,
          message: 'Request timeout. Please try again.',
          code: 'REQUEST_TIMEOUT',
          recoveryAction: 'retry',
        });

        errorLogger.error(timeoutError, {
          url,
          method: config.method || 'GET',
          requestId,
        });

        throw timeoutError;
      }

      // Re-throw ApplicationError
      if (isApplicationError(error)) {
        throw error;
      }

      // Convert unknown errors
      const unknownError = new ApplicationError({
        category: ErrorCategory.UNKNOWN,
        message: error instanceof Error ? error.message : String(error),
        code: 'UNKNOWN_ERROR',
      });

      errorLogger.error(unknownError, {
        url,
        method: config.method || 'GET',
        requestId,
      });

      throw unknownError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const headers: Record<string, string> = { ...(config?.headers || {}) };

    // Handle FormData
    if (body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set it
      return this.request<T>(endpoint, {
        ...config,
        method: 'POST',
        body,
        headers,
      });
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const headers: Record<string, string> = { ...(config?.headers || {}) };

    // Handle FormData
    if (body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set it
      return this.request<T>(endpoint, {
        ...config,
        method: 'PUT',
        body,
        headers,
      });
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const headers: Record<string, string> = { ...(config?.headers || {}) };

    // Handle FormData
    if (body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set it
      return this.request<T>(endpoint, {
        ...config,
        method: 'PATCH',
        body,
        headers,
      });
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient();

export default apiClient;
