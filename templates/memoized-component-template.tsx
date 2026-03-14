/**
 * MemoizedComponentName - Brief description of what this component does
 * 
 * This is a memoized component that prevents unnecessary re-renders
 * when props haven't changed. Use this for pure components that
 * receive complex props or are rendered frequently.
 * 
 * @example
 * ```tsx
 * const handleClick = useCallback(() => {
 *   console.log('clicked');
 * }, []);
 * 
 * <MemoizedComponentName onClick={handleClick} data={data} />
 * ```
 * 
 * @component
 */

import React, { useCallback, useMemo } from 'react';

/**
 * Props for MemoizedComponentName
 */
interface MemoizedComponentNameProps {
  /** Data to display */
  data: any[];
  
  /** Callback when item is clicked */
  onClick?: (item: any) => void;
  
  /** Whether component is loading */
  isLoading?: boolean;
  
  /** CSS class name */
  className?: string;
}

/**
 * Memoized component implementation
 * 
 * This component demonstrates memoization best practices:
 * - Uses React.memo to prevent unnecessary re-renders
 * - Uses useCallback for stable callback references
 * - Uses useMemo for expensive computations
 * - Properly typed with TypeScript
 */
export const MemoizedComponentName = React.memo(({
  data,
  onClick,
  isLoading = false,
  className,
}: MemoizedComponentNameProps) => {
  // Memoize callback to maintain referential equality
  const handleItemClick = useCallback((item: any) => {
    onClick?.(item);
  }, [onClick]);

  // Memoize expensive computation
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  if (isLoading) {
    return <div className={className}>Loading...</div>;
  }

  return (
    <div className={className}>
      <ul>
        {sortedData.map((item) => (
          <li
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="cursor-pointer hover:bg-gray-100 p-2"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
});

MemoizedComponentName.displayName = 'MemoizedComponentName';
