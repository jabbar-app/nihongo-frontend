/**
 * useHookName - Brief description of what this hook does
 * 
 * This hook is responsible for [specific functionality].
 * It manages [state/logic description].
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 * 
 * @param {string} param1 - Description of param1
 * @param {number} [param2=0] - Description of param2 (optional)
 * @returns {Object} Object containing state and methods
 * @returns {any} returns.state - Description of state
 * @returns {Function} returns.setState - Function to update state
 * 
 * @example
 * ```typescript
 * const { state, setState } = useHookName('value', 42);
 * ```
 * 
 * @example
 * ```typescript
 * const { state, setState, reset } = useHookName('initial');
 * 
 * useEffect(() => {
 *   setState('new value');
 * }, []);
 * ```
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Return type for useHookName
 */
interface UseHookNameReturn {
  /** Current state value */
  state: any;
  
  /** Function to update state */
  setState: (value: any) => void;
  
  /** Function to reset state to initial value */
  reset: () => void;
  
  /** Whether state is loading */
  isLoading: boolean;
  
  /** Error if any */
  error: Error | null;
}

/**
 * Hook implementation
 * 
 * This hook demonstrates best practices:
 * - Follows Rules of Hooks
 * - Uses useCallback for stable callbacks
 * - Handles cleanup in useEffect
 * - Provides consistent return type
 * - Includes error handling
 */
export function useHookName(
  param1: string,
  param2: number = 0
): UseHookNameReturn {
  const [state, setState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initialValue = param1;

  // Memoize setState callback
  const handleSetState = useCallback((value: any) => {
    setState(value);
  }, []);

  // Memoize reset callback
  const handleReset = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);

  // Initialize state on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      // Initialize state here
      setState(initialValue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [initialValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup here if needed
    };
  }, []);

  return {
    state,
    setState: handleSetState,
    reset: handleReset,
    isLoading,
    error,
  };
}
