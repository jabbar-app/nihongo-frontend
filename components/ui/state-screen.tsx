'use client';

import { ReactNode } from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import React from 'react';

interface StateScreenProps {
  type: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  fullScreen?: boolean;
  className?: string;
}

/**
 * StateScreen Component
 * 
 * A consolidated component for displaying different application states:
 * - loading: Shows spinner with optional message
 * - error: Shows error icon with title and message
 * - empty: Shows empty state with icon and optional action
 * 
 * Memoized to prevent unnecessary re-renders.
 * 
 * @example
 * ```tsx
 * <StateScreen type="loading" message="Loading data..." />
 * <StateScreen type="error" title="Error" message="Failed to load" />
 * <StateScreen type="empty" title="No items" action={<Button>Create</Button>} />
 * ```
 */
function StateScreen({
  type,
  title,
  message,
  icon,
  action,
  fullScreen = false,
  className = '',
}: StateScreenProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-16 px-6 text-center';

  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <>
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-12 h-12 rounded-full border-4 border-teal-500/20 animate-ping" />
              <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin" />
            </div>
            {message && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide animate-pulse">
                {message}
              </p>
            )}
          </>
        );

      case 'error':
        return (
          <>
            <div className="flex items-center justify-center rounded-2xl w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-6">
              {icon || <AlertCircle className="w-10 h-10" />}
            </div>
            {title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
            )}
            {message && (
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-sm">
                {message}
              </p>
            )}
            {action && <div className="flex justify-center">{action}</div>}
          </>
        );

      case 'empty':
        return (
          <>
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-6 text-gray-400 dark:text-gray-500 transform -rotate-3 group-hover:rotate-0 transition-transform">
              {icon || <Search className="w-10 h-10 opacity-40" />}
            </div>
            {title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
            )}
            {message && (
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-sm">
                {message}
              </p>
            )}
            {action && <div className="flex justify-center">{action}</div>}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      {renderContent()}
    </div>
  );
}

StateScreen.displayName = 'StateScreen';

export default React.memo(StateScreen);
