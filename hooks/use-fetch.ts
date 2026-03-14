/**
 * useFetch Hook
 * 
 * Hook for fetching data from API endpoints with caching and error handling.
 * Automatically handles loading, error, and data states.
 * 
 * @module hooks/use-fetch
 */

import React from 'react';
import { apiClient } from '@/api/client';
import { ApplicationError, toApplicationError } from '@/types/errors';

/**
 * Return type for useFetch hook
 */
export interface UseFetchReturn<T> {
  /** Current status of the fetch operation */
  status: 'idle' | 'pending' | 'success' | 'error';
  
  /** Fetched data */
  data: T | null;
  
  /** Error from failed fetch */
  error: ApplicationError | null;
  
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  
  /** Function to reset the state */
  reset: () => void;
}

/**
 * Cache for fetch results
 */
const fetchCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Hook for fetching data from API
 * 
 * Fetches data from the specified endpoint with optional caching.
 * Automatically handles loading, error, and data states.
 * 
 * @param url - API endpoint URL
 * @param options - Configuration options
 * @returns Object with status, data, error, refetch, and reset
 * 
 * @example
 * ```typescript
 * const { status, data, error, refetch } = useFetch<User>('/api/users/123');
 * 
 * if (status === 'pending') return <div>Loading...</div>;
 * if (status === 'error') return <div>Error: {error?.message}</div>;
 * if (status === 'success') return <div>{data?.name}</div>;
 * ```
 */
export function useFetch<T>(
  url: string,
  options?: {
    /** Whether to fetch immediately on mount (default: true) */
    immediate?: boolean;
    
    /** Cache duration in milliseconds (default: 0 - no cache) */
    cacheDuration?: number;
    
    /** Dependency array for re-fetch (default: [url]) */
    dependencies?: React.DependencyList;
  }
): UseFetchReturn<T> {
  const { immediate = true, cacheDuration = 0, dependencies = [url] } = options || {};

  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<ApplicationError | null>(null);

  /**
   * Fetch data from API
   */
  const refetch = React.useCallback(async () => {
    // Check cache
    if (cacheDuration > 0) {
      const cached = fetchCache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        setStatus('success');
        return;
      }
    }

    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const result = await apiClient.get<T>(url);
      setData(result);
      setStatus('success');

      // Cache result
      if (cacheDuration > 0) {
        fetchCache.set(url, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      const appError = toApplicationError(err);
      setError(appError);
      setStatus('error');
    }
  }, [url, cacheDuration]);

  /**
   * Reset the state
   */
  const reset = React.useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  /**
   * Fetch on mount if immediate is true
   */
  React.useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, dependencies);

  return { status, data, error, refetch, reset };
}

/**
 * Clear all cached fetch results
 */
export function clearFetchCache(): void {
  fetchCache.clear();
}

/**
 * Clear specific cached fetch result
 */
export function clearFetchCacheForUrl(url: string): void {
  fetchCache.delete(url);
}

export default useFetch;
