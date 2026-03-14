/**
 * Error Categories
 * 
 * Defines all possible error categories for standardized error handling.
 * Each category represents a specific type of error that can occur in the application.
 * 
 * @module types/errors/error-categories
 */

/**
 * Enum of all possible error categories
 * 
 * - NETWORK: Network connectivity issues (no internet, timeout, etc.)
 * - VALIDATION: Input validation errors (invalid form data, etc.)
 * - AUTHENTICATION: Authentication failures (invalid credentials, expired token, etc.)
 * - AUTHORIZATION: Authorization failures (insufficient permissions, etc.)
 * - SERVER: Server-side errors (5xx status codes, etc.)
 * - NOT_FOUND: Resource not found (404 status code, etc.)
 * - CONFLICT: Resource conflict (409 status code, duplicate entry, etc.)
 * - UNKNOWN: Unknown or unexpected errors
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Type for recovery actions that can be suggested for errors
 * 
 * - retry: Retry the failed operation
 * - refresh: Refresh the page or data
 * - login: Redirect to login page
 * - navigate: Navigate to a different page
 */
export type RecoveryAction = 'retry' | 'refresh' | 'login' | 'navigate';
