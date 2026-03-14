/**
 * Common Type Mappers
 * 
 * Mapper functions for common API response structures.
 */

import type { PaginatedResponse, PaginationMeta } from '../api/common';

/**
 * Maps API pagination metadata to domain pagination metadata
 * 
 * @param meta - API pagination metadata
 * @returns Mapped pagination metadata
 * 
 * @example
 * ```typescript
 * const meta = mapPaginationMeta(apiResponse.meta);
 * ```
 */
export const mapPaginationMeta = (meta: PaginationMeta): PaginationMeta => ({
  current_page: meta.current_page,
  per_page: meta.per_page,
  total: meta.total,
  last_page: meta.last_page,
  from: meta.from,
  to: meta.to,
});

/**
 * Maps a paginated API response to a paginated domain response
 * 
 * @param response - Paginated API response
 * @param itemMapper - Function to map individual items
 * @returns Mapped paginated response
 * 
 * @example
 * ```typescript
 * const users = mapPaginatedResponse(apiResponse, mapUserResponse);
 * ```
 */
export const mapPaginatedResponse = <TApi, TDomain>(
  response: PaginatedResponse<TApi>,
  itemMapper: (item: TApi) => TDomain
): PaginatedResponse<TDomain> => ({
  data: response.data.map(itemMapper),
  meta: mapPaginationMeta(response.meta),
  links: response.links,
});

/**
 * Converts an ISO date string to a Date object
 * 
 * @param dateString - ISO date string
 * @returns Date object
 * 
 * @example
 * ```typescript
 * const date = parseISODate('2024-01-15T10:30:00Z');
 * ```
 */
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Safely parses a date string, returning null if invalid
 * 
 * @param dateString - Date string or null
 * @returns Date object or null
 * 
 * @example
 * ```typescript
 * const date = parseDateOrNull(response.ended_at);
 * ```
 */
export const parseDateOrNull = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  try {
    return parseISODate(dateString);
  } catch {
    return null;
  }
};
