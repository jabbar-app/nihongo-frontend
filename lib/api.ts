import { API_CONSTANTS } from '@/constants/api';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

class ApiClient {
  private getHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers[API_CONSTANTS.HEADERS.AUTHORIZATION] = `${API_CONSTANTS.AUTH_PREFIX}${token}`;
    }

    return headers;
  }

  async request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY) : null;

    const headers = {
      ...this.getHeaders(token),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (response.status === API_CONSTANTS.STATUS.UNAUTHORIZED) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
          window.location.href = ROUTES.AUTH.LOGIN;
        }
        throw new Error(API_CONSTANTS.ERRORS.UNAUTHORIZED);
      }

      if (!response.ok) {
        let errorMessage = `${API_CONSTANTS.ERRORS.PREFIX}${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      if (response.status === API_CONSTANTS.STATUS.NO_CONTENT) {
        return {} as T;
      }

      return response.json();
    } catch (err) {
      throw err;
    }
  }

  get<T = any>(endpoint: string, options: FetchOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body: any, options: FetchOptions = {}) {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = { ...(options.headers || {}) };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers,
    });
  }

  put<T = any>(endpoint: string, body: any, options: FetchOptions = {}) {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = { ...(options.headers || {}) };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      headers,
    });
  }

  delete<T = any>(endpoint: string, options: FetchOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
