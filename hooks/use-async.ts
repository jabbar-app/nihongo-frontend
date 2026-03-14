/**
 * useAsync Hook
 * 
 * Hook for handling async operations with loading, error, and data states.
 * Automatically executes the async function on mount or when dependencies change.
 * 
 * @module hooks/use-async
 */

import React from 'react';
import { ApplicationError, toApplicationError } from '@/types/errors';

/**
 * Return type for useAsync hook
 */
export interface UseAsyncReturn<T> {
  /** Current status of the async operation */
  status: 'idle' | 'pending' | 'success' | 'error';
  
  /** Data returned from successful operation */
  data: T | null;
  
  /** Error from failed operation */
  error: ApplicationError | null;
  
  /** Function to manually execute the async operation */
  execute: () => Promise<void>;
  
  /** Function to reset the state */
  reset: () => void;
}

/**
 * Hook for handling async operations
 * 
 * Manages loading, error, and data states for async operations.
 * Automatically executes on mount if immediate is true.
 * 
 * @param asyncFunction - Async function to execute
 * @param immediate - Whether to execute immediately on mount (default: true)
 * @param dependencies - Dependency array for re-execution (default: [asyncFunction])
 * @returns Object with status, data, error, execute, and reset
 * 
 * @example
 * ```typescript
 * const { status, data, error, execute } = useAsync(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   },
 *   true
 * );
 * 
 * if (status === 'pending') return <div>Loading...</div>;
 * if (status === 'error') return <div>Error: {error?.message}</div>;
 * if (status === 'success') return <div>{JSON.stringify(data)}</div>;
 * ```
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
  dependencies: React.DependencyList = [asyncFunction]
): UseAsyncReturn<T> {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<ApplicationError | null>(null);

  /**
   * Execute the async function
   */
  const execute = React.useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      setStatus('success');
    } catch (err) {
      const appError = toApplicationError(err);
      setError(appError);
      setStatus('error');
    }
  }, [asyncFunction]);

  /**
   * Reset the state
   */
  const reset = React.useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  /**
   * Execute on mount if immediate is true
   */
  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { status, data, error, execute, reset };
}

export default useAsync;
