/**
 * Common API Types
 * 
 * Shared type definitions for API requests and responses.
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Response status code */
  status: number;
  /** Response message */
  message?: string;
  /** Response timestamp */
  timestamp?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  /** Array of data items */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
  /** Links for pagination */
  links?: PaginationLinks;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  current_page: number;
  /** Number of items per page */
  per_page: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  last_page: number;
  /** Index of first item on current page */
  from: number;
  /** Index of last item on current page */
  to: number;
}

/**
 * Pagination links
 */
export interface PaginationLinks {
  /** URL for first page */
  first: string | null;
  /** URL for last page */
  last: string | null;
  /** URL for previous page */
  prev: string | null;
  /** URL for next page */
  next: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  status: number;
  /** Validation errors (if applicable) */
  errors?: Record<string, string[]>;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Fetch options for API requests
 */
export interface FetchOptions {
  /** Request method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials */
  credentials?: RequestCredentials;
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  /** Page number for pagination */
  page?: number;
  /** Number of items per page */
  per_page?: number;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Search query */
  search?: string;
  /** Filter parameters */
  [key: string]: string | number | boolean | undefined;
}
