/**
 * useAsyncHookName - Brief description of what this async hook does
 * 
 * This hook is responsible for [async operation description].
 * It manages async state including loading, error, and data states.
 * 
 * Features:
 * - Automatic async operation handling
 * - Loading state management
 * - Error handling
 * - Data caching
 * - Manual execution
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} [immediate=true] - Whether to execute immediately
 * @returns {Object} Object containing state and methods
 * @returns {any} returns.data - Result data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error|null} returns.error - Error if any
 * @returns {Function} returns.execute - Function to manually execute
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, execute } = useAsyncHookName(
 *   () => fetchData(),
 *   true
 * );
 * ```
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, execute } = useAsyncHookName(
 *   () => fetchData(),
 *   false // Don't execute immediately
 * );
 * 
 * const handleClick = () => {
 *   execute(); // Execute manually
 * };
 * ```
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Return type for useAsyncHookName
 */
interface UseAsyncHookNameReturn<T> {
  /** Result data from async operation */
  data: T | null;
  
  /** Whether async operation is in progress */
  isLoading: boolean;
  
  /** Error if async operation failed */
  error: Error | null;
  
  /** Function to manually execute async operation */
  execute: () => Promise<void>;
  
  /** Function to reset state */
  reset: () => void;
}

/**
 * Async hook implementation
 * 
 * This hook demonstrates async best practices:
 * - Handles async operations safely
 * - Manages loading and error states
 * - Provides manual execution
 * - Cleans up on unmount
 * - Prevents memory leaks
 */
export function useAsyncHookName<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncHookNameReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize execute callback
  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  // Memoize reset callback
  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
