/**
 * ContextName - Brief description of what this context manages
 * 
 * This context manages [state description].
 * Use the useContextName hook to access context values.
 * 
 * Features:
 * - State management
 * - Action methods
 * - Error handling
 * - Type safety
 * 
 * @example
 * ```tsx
 * <ContextNameProvider>
 *   <App />
 * </ContextNameProvider>
 * ```
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, setState } = useContextName();
 *   
 *   return <div>{state}</div>;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Context value type
 */
interface ContextNameContextType {
  /** Current state value */
  state: any;
  
  /** Function to update state */
  setState: (value: any) => void;
  
  /** Function to reset state */
  reset: () => void;
  
  /** Whether context is initialized */
  isInitialized: boolean;
}

/**
 * Create context
 */
const ContextNameContext = createContext<ContextNameContextType | undefined>(
  undefined
);

/**
 * Provider component props
 */
interface ContextNameProviderProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Initial state value */
  initialValue?: any;
}

/**
 * Provider component
 * 
 * This provider demonstrates best practices:
 * - Uses createContext for type safety
 * - Provides memoized callbacks
 * - Includes error handling
 * - Proper TypeScript typing
 */
export function ContextNameProvider({
  children,
  initialValue = null,
}: ContextNameProviderProps) {
  const [state, setState] = useState<any>(initialValue);
  const [isInitialized, setIsInitialized] = useState(true);

  // Memoize setState callback
  const handleSetState = useCallback((value: any) => {
    setState(value);
  }, []);

  // Memoize reset callback
  const handleReset = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);

  const value: ContextNameContextType = {
    state,
    setState: handleSetState,
    reset: handleReset,
    isInitialized,
  };

  return (
    <ContextNameContext.Provider value={value}>
      {children}
    </ContextNameContext.Provider>
  );
}

/**
 * Hook to use context
 * 
 * @returns {ContextNameContextType} Context value
 * @throws {Error} If used outside of ContextNameProvider
 * 
 * @example
 * ```typescript
 * const { state, setState } = useContextName();
 * ```
 */
export function useContextName(): ContextNameContextType {
  const context = useContext(ContextNameContext);
  
  if (!context) {
    throw new Error(
      'useContextName must be used within ContextNameProvider'
    );
  }
  
  return context;
}

/**
 * Higher-order component to wrap components with provider
 * 
 * @param {React.ComponentType} Component - Component to wrap
 * @returns {React.ComponentType} Wrapped component
 * 
 * @example
 * ```typescript
 * const WrappedComponent = withContextName(MyComponent);
 * ```
 */
export function withContextName<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ContextNameProvider>
        <Component {...props} />
      </ContextNameProvider>
    );
  };
}
