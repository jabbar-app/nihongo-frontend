/**
 * API Constants
 * 
 * Contains all API-related constants including base URLs, endpoints,
 * headers, status codes, and error messages.
 * 
 * @example
 * ```typescript
 * import { API_CONSTANTS, AUTH_CONSTANTS } from '@/constants';
 * 
 * // Make authenticated API request
 * const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
 * const response = await fetch(
 *   `${API_CONSTANTS.DEFAULT_BASE_URL}${API_CONSTANTS.ENDPOINTS.DASHBOARD}`,
 *   {
 *     headers: {
 *       [API_CONSTANTS.HEADERS.AUTHORIZATION]: 
 *         `${API_CONSTANTS.AUTH_PREFIX}${token}`,
 *       [API_CONSTANTS.HEADERS.CONTENT_TYPE]: 
 *         API_CONSTANTS.HEADERS.ACCEPT,
 *     },
 *   }
 * );
 * 
 * // Check response status
 * if (response.status === API_CONSTANTS.STATUS.UNAUTHORIZED) {
 *   // Handle unauthorized
 * }
 * ```
 */
export const API_CONSTANTS = {
  /** Default API base URL */
  DEFAULT_BASE_URL: 'http://localhost:8000',
  
  /** Bearer token prefix for Authorization header */
  AUTH_PREFIX: 'Bearer ',
  
  /** Request timeout in milliseconds (30 seconds) */
  TIMEOUT_MS: 30000,
  
  /** Number of retry attempts for failed requests */
  RETRY_ATTEMPTS: 3,
  
  /** Standard HTTP headers */
  HEADERS: {
    /** Accept header value */
    ACCEPT: 'application/json',
    /** Content-Type header value */
    CONTENT_TYPE: 'application/json',
    /** Authorization header name */
    AUTHORIZATION: 'Authorization',
  },
  
  /** HTTP status codes */
  STATUS: {
    /** Success status (200) */
    OK: 200,
    /** No content status (204) */
    NO_CONTENT: 204,
    /** Unauthorized status (401) */
    UNAUTHORIZED: 401,
    /** Not found status (404) */
    NOT_FOUND: 404,
    /** Server error status (500) */
    SERVER_ERROR: 500,
  },
  
  /** API endpoint paths */
  ENDPOINTS: {
    /** Authentication endpoints */
    AUTH: {
      /** Login endpoint */
      LOGIN: '/api/v1/auth/login',
      /** Registration endpoint */
      REGISTER: '/api/v1/auth/register',
      /** Logout endpoint */
      LOGOUT: '/api/v1/auth/logout',
    },
    /** Dashboard endpoint */
    DASHBOARD: '/api/v1/dashboard',
    /** Review endpoints */
    REVIEW: {
      /** Review queue endpoint */
      QUEUE: '/api/v1/review/queue',
    },
    /** Decks endpoint */
    DECKS: '/api/v1/decks',
    /** Practice endpoints */
    PRACTICE: {
      /** Speech practice messages endpoint */
      SPEECH: '/api/v1/practice/messages',
    },
    /** Profile endpoints */
    PROFILE: {
      /** Get current user endpoint */
      ME: '/api/v1/me',
      /** Update profile endpoint */
      UPDATE: '/api/v1/profile/update',
      /** Update password endpoint */
      PASSWORD: '/api/v1/profile/password',
    },
    /** Notes endpoint */
    NOTES: '/api/v1/notes',
    /** Readings endpoint */
    READINGS: '/api/v1/readings',
  },
  
  /** API error messages */
  ERRORS: {
    /** Unauthorized error message */
    UNAUTHORIZED: 'Unauthorized',
    /** Error message prefix */
    PREFIX: 'API Error: ',
    /** Generic error message */
    GENERIC: 'An error occurred',
  },
} as const;
