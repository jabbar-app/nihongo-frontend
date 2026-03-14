/**
 * ComponentName - Brief description of what this component does
 * 
 * This component is responsible for [specific functionality].
 * It accepts [props description] and returns [return description].
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 * 
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={42} />
 * ```
 * 
 * @example
 * ```tsx
 * <ComponentName prop1="value" onAction={() => console.log('clicked')}>
 *   Child content
 * </ComponentName>
 * ```
 * 
 * @component
 */

import React from 'react';

/**
 * Props for ComponentName
 */
interface ComponentNameProps {
  /** Description of prop1 - required string prop */
  prop1: string;
  
  /** Description of prop2 - optional number prop with default value */
  prop2?: number;
  
  /** Callback when action occurs */
  onAction?: () => void;
  
  /** Child elements to render */
  children?: React.ReactNode;
  
  /** CSS class name for styling */
  className?: string;
}

/**
 * Main component implementation
 * 
 * This component demonstrates best practices:
 * - Uses React.memo for performance optimization
 * - Includes proper TypeScript types
 * - Has JSDoc comments
 * - Uses displayName for debugging
 * - Handles optional props with defaults
 */
export const ComponentName = React.memo(({
  prop1,
  prop2 = 0,
  onAction,
  children,
  className,
}: ComponentNameProps) => {
  // Component logic here
  const handleClick = React.useCallback(() => {
    onAction?.();
  }, [onAction]);

  return (
    <div className={className}>
      {/* Component JSX here */}
      <h2>{prop1}</h2>
      <p>Value: {prop2}</p>
      <button onClick={handleClick}>Action</button>
      {children}
    </div>
  );
});

// Display name for debugging in React DevTools
ComponentName.displayName = 'ComponentName';
