/**
 * useLocalStorage Hook
 * 
 * Hook for managing state that persists to localStorage.
 * Automatically syncs state with localStorage and handles SSR.
 * 
 * @module hooks/use-local-storage
 */

import React from 'react';

/**
 * Hook for managing localStorage state
 * 
 * Provides a way to store and retrieve values from localStorage
 * with automatic synchronization and SSR support.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 * 
 * @example
 * ```typescript
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 * 
 * // Get value
 * console.log(theme); // 'light'
 * 
 * // Set value (updates both state and localStorage)
 * setTheme('dark');
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      // Check if we're in browser
      if (typeof window === 'undefined') {
        return initialValue;
      }

      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or if none return initialValue
      if (item) {
        return JSON.parse(item) as T;
      }

      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Return a wrapped version of useState's setter function that
   * persists the new value to localStorage
   */
  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook for managing sessionStorage state
 * 
 * Similar to useLocalStorage but uses sessionStorage instead.
 * 
 * @param key - sessionStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.sessionStorage.getItem(key);

      if (item) {
        return JSON.parse(item) as T;
      }

      return initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
